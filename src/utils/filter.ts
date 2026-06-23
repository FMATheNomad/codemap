import * as path from 'path';

const DEFAULT_EXCLUDE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/__pycache__/**',
  '**/*.min.*',
  '**/coverage/**',
  '**/.vscode/**',
  '**/.idea/**',
  '**/*.snap',
  '**/venv/**',
  '**/.env/**',
  '**/out/**',
  '**/.cache/**',
  '**/tmp/**',
];

function matchGlob(filePath: string, pattern: string): boolean {
  const normalizedPath = filePath.split(path.sep).join('/');

  if (pattern.startsWith('**/')) {
    const suffix = pattern.slice(3);
    if (suffix.endsWith('/**')) {
      const prefix = suffix.slice(0, -3);
      return normalizedPath.includes(prefix);
    }
    if (suffix.includes('*')) {
      const parts = suffix.split('*');
      return parts.every(p => normalizedPath.includes(p));
    }
    return normalizedPath.includes(suffix) || normalizedPath.endsWith(suffix);
  }

  if (pattern.includes('*')) {
    const parts = pattern.split('*');
    let searchStr = normalizedPath;
    for (const part of parts) {
      const idx = searchStr.indexOf(part);
      if (idx === -1) return false;
      searchStr = searchStr.slice(idx + part.length);
    }
    return true;
  }

  return normalizedPath === pattern || normalizedPath.startsWith(pattern);
}

export function shouldExclude(filePath: string, customPatterns?: string[]): boolean {
  const patterns = [...DEFAULT_EXCLUDE, ...(customPatterns || [])];

  for (const pattern of patterns) {
    if (matchGlob(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

export function getDefaultExcludePatterns(): string[] {
  return [...DEFAULT_EXCLUDE];
}
