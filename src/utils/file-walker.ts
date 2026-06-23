import * as fs from 'fs';
import * as path from 'path';
import { shouldExclude } from './filter';

export interface WalkOptions {
  excludePatterns?: string[];
  maxDepth?: number;
}

export function walkFiles(rootPath: string, options: WalkOptions = {}): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const files: string[] = [];
    const maxDepth = options.maxDepth ?? 10;
    const excludePatterns = options.excludePatterns ?? [];

    function walk(dir: string, depth: number) {
      if (depth > maxDepth) return;

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (shouldExclude(fullPath, excludePatterns)) continue;

          if (entry.isDirectory()) {
            walk(fullPath, depth + 1);
          } else if (entry.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        console.warn(`[codemap] Error reading directory ${dir}:`, err);
      }
    }

    try {
      walk(rootPath, 0);
      resolve(files);
    } catch (err) {
      reject(err);
    }
  });
}
