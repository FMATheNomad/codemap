import * as path from 'path';

export interface ParseResult {
  references: string[];
  localDependencies: string[];
}

export class GenericParser {
  parse(filePath: string, content: string): ParseResult {
    const references: string[] = [];
    const localDependencies: string[] = [];

    const refRegex = /['"]([./][^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = refRegex.exec(content)) !== null) {
      const ref = match[1];
      references.push(ref);

      if (ref.startsWith('.') || ref.startsWith('/')) {
        const dir = path.dirname(filePath);
        const resolved = path.resolve(dir, ref);
        const normalized = path.normalize(resolved);
        localDependencies.push(normalized);
      }
    }

    const requireRegex = /require\s*\(\s*['"]([./][^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const ref = match[1];
      references.push(ref);
      if (ref.startsWith('.')) {
        const dir = path.dirname(filePath);
        const resolved = path.resolve(dir, ref);
        localDependencies.push(path.normalize(resolved));
      }
    }

    return { references, localDependencies };
  }
}
