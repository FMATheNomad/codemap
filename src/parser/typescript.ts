import * as path from 'path';

export interface ParseResult {
  imports: string[];
  exports: string[];
  localDependencies: string[];
}

export class TypeScriptParser {
  parse(filePath: string, content: string): ParseResult {
    const imports: string[] = [];
    const exports: string[] = [];
    const localDependencies: string[] = [];

    const importRegex = /(?:import|export)\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+(?:\s*,\s*\w+)?)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(content)) !== null) {
      const modulePath = match[1];
      imports.push(modulePath);

      if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
        const resolved = resolveLocalPath(filePath, modulePath);
        if (resolved) {
          localDependencies.push(resolved);
        }
      }
    }

    const exportRegex = /export\s+(default\s+)?(?:function|class|const|let|var|interface|type|enum|abstract\s+class|async\s+function)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[2] || match[1]?.trim());
    }

    const exportDefaultRegex = /export\s+default\s+(?:function\s+)?(\w+)/g;
    while ((match = exportDefaultRegex.exec(content)) !== null) {
      if (match[1]) exports.push(`default:${match[1]}`);
    }

    return { imports, exports, localDependencies };
  }
}

function resolveLocalPath(filePath: string, modulePath: string): string | null {
  const dir = path.dirname(filePath);
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.js', '/index.tsx', '/index.jsx'];

  if (!modulePath.startsWith('.')) return null;

  const resolved = path.resolve(dir, modulePath);

  for (const ext of extensions) {
    const fullPath = resolved + ext;
    if (fullPath) return path.normalize(fullPath);
  }

  return path.normalize(resolved);
}
