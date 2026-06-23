import * as path from 'path';

export interface ParseResult {
  imports: string[];
  localDependencies: string[];
}

export class PythonParser {
  parse(filePath: string, content: string): ParseResult {
    const imports: string[] = [];
    const localDependencies: string[] = [];

    const importRegex = /^(?:from\s+([.\w]+)\s+)?import\s+(.+)$/gm;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(content)) !== null) {
      const moduleFrom = match[1];
      const moduleWhat = match[2];

      if (moduleFrom) {
        imports.push(moduleFrom);
        if (moduleFrom.startsWith('.') || !moduleFrom.includes('.')) {
          const local = resolvePythonPath(filePath, moduleFrom);
          if (local) localDependencies.push(local);
        }
      } else {
        const parts = moduleWhat.split(',').map(s => s.trim().split(' as ')[0].split('.')[0]);
        for (const p of parts) {
          imports.push(p);
          if (p.startsWith('.')) {
            const local = resolvePythonPath(filePath, p);
            if (local) localDependencies.push(local);
          } else {
            const local = resolvePythonPath(filePath, p);
            if (local && !local.includes('site-packages')) {
              localDependencies.push(local);
            }
          }
        }
      }
    }

    const simpleImportRegex = /^import\s+([\w.]+(?:\s*,\s*[\w.]+)*)$/gm;
    while ((match = simpleImportRegex.exec(content)) !== null) {
      const modules = match[1].split(',').map(s => s.trim());
      for (const mod of modules) {
        imports.push(mod);
        const local = resolvePythonPath(filePath, mod);
        if (local) localDependencies.push(local);
      }
    }

    return { imports, localDependencies };
  }
}

function resolvePythonPath(filePath: string, moduleName: string): string | null {
  if (moduleName.startsWith('.')) {
    const dir = path.dirname(filePath);
    const parts = moduleName.split('.');
    let baseDir = dir;
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i] === '..') {
        baseDir = path.resolve(baseDir, '..');
      }
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== '..') {
      const possible = path.join(baseDir, lastPart.replace('.', '/'));
      return path.normalize(possible + '.py');
    }
    return null;
  }

  const normalized = moduleName.replace(/\./g, '/');
  const possible = path.join(path.dirname(filePath), normalized);
  return path.normalize(possible + '.py');
}
