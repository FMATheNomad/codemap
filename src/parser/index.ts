import * as path from 'path';
import * as fs from 'fs';
import { DependencyGraph, GraphNode, GraphEdge, createEmptyGraph, detectCircularDependencies, calculateCentrality, computeOrphans, computeStats } from './graph';
import { TypeScriptParser } from './typescript';
import { PythonParser } from './python';
import { GenericParser } from './generic';
import { walkFiles } from '../utils/file-walker';
import { getConfig } from '../utils/config';

export interface ParserOptions {
  rootPath: string;
  maxDepth?: number;
  excludePatterns?: string[];
  maxNodes?: number;
}

export class CodeMapGenerator {
  private tsParser = new TypeScriptParser();
  private pyParser = new PythonParser();
  private genericParser = new GenericParser();
  private entryPointPatterns = ['main.ts', 'index.ts', 'main.py', 'app.tsx', 'App.tsx', 'cli.ts', 'index.js', 'main.js', 'app.js', 'App.js'];

  async generate(options: ParserOptions): Promise<DependencyGraph> {
    const graph = createEmptyGraph();
    const config = getConfig();

    const maxDepth = options.maxDepth ?? config.maxDepth;
    const excludePatterns = options.excludePatterns ?? config.excludePatterns;
    const maxNodes = options.maxNodes ?? config.maxNodes;

    const files = await walkFiles(options.rootPath, {
      excludePatterns,
      maxDepth,
    });

    if (files.length > maxNodes) {
      console.warn(`[codemap] Workspace has ${files.length} files, exceeding max ${maxNodes}. Truncating.`);
    }

    const filesToProcess = files.slice(0, maxNodes);

    for (const filePath of filesToProcess) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.length > 500 * 1024) continue;

        const relativePath = path.relative(options.rootPath, filePath);
        const ext = path.extname(filePath).toLowerCase();
        const label = path.basename(filePath);
        const language = this.detectLanguage(ext);
        const isEntryPoint = this.isEntryPoint(relativePath, label);

        const node: GraphNode = {
          id: relativePath,
          label,
          path: relativePath,
          type: 'file',
          language,
          size: content.length,
          dependencies: [],
          dependents: [],
          isEntryPoint,
          isOrphan: false,
          hasCircularDependency: false,
          centrality: 0,
        };

        graph.nodes.set(node.id, node);

        const parseResult = this.parseFile(filePath, ext, content);
        for (const depPath of parseResult.localDependencies) {
          const depRelative = path.relative(options.rootPath, depPath);
          const depId = depRelative.split(path.sep).join('/');
          if (!node.dependencies.includes(depId)) {
            node.dependencies.push(depId);
          }
        }
      } catch (err) {
        const relativePath = path.relative(options.rootPath, filePath);
        console.warn(`[codemap] Error parsing ${relativePath}:`, err);
      }
    }

    for (const node of graph.nodes.values()) {
      for (const depId of node.dependencies) {
        if (graph.nodes.has(depId)) {
          const depNode = graph.nodes.get(depId)!;
          if (!depNode.dependents.includes(node.id)) {
            depNode.dependents.push(node.id);
          }

          const edge: GraphEdge = {
            source: node.id,
            target: depId,
            label: 'depends-on',
            isCircular: false,
          };
          graph.edges.push(edge);
        }
      }
    }

    detectCircularDependencies(graph);
    calculateCentrality(graph);
    computeOrphans(graph);
    computeStats(graph);

    return graph;
  }

  private detectLanguage(ext: string): string {
    const langMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.mjs': 'JavaScript',
      '.cjs': 'JavaScript',
      '.py': 'Python',
      '.go': 'Go',
      '.rs': 'Rust',
      '.java': 'Java',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.c': 'C',
      '.cpp': 'C++',
      '.h': 'C',
      '.hpp': 'C++',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.vue': 'Vue',
      '.svelte': 'Svelte',
      '.astro': 'Astro',
    };
    return langMap[ext] || 'Other';
  }

  private isEntryPoint(relativePath: string, label: string): boolean {
    if (this.entryPointPatterns.includes(label)) return true;
    if (label === 'package.json') {
      try {
        const content = fs.readFileSync(relativePath, 'utf-8');
        const pkg = JSON.parse(content);
        return !!pkg.main || !!pkg.bin;
      } catch {
        return false;
      }
    }
    return false;
  }

  private parseFile(filePath: string, ext: string, content: string) {
    const tsExts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
    const pyExts = ['.py'];

    if (tsExts.includes(ext)) {
      return this.tsParser.parse(filePath, content);
    }
    if (pyExts.includes(ext)) {
      const pyResult = this.pyParser.parse(filePath, content);
      return {
        imports: pyResult.imports,
        exports: [] as string[],
        localDependencies: pyResult.localDependencies,
      };
    }

    const genResult = this.genericParser.parse(filePath, content);
    return {
      imports: genResult.references,
      exports: [] as string[],
      localDependencies: genResult.localDependencies,
    };
  }
}
