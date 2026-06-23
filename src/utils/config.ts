import * as vscode from 'vscode';

export interface CodemapConfig {
  maxDepth: number;
  excludePatterns: string[];
  autoGenerateOnOpen: boolean;
  theme: 'dark' | 'light';
  maxNodes: number;
}

export function getConfig(): CodemapConfig {
  const config = vscode.workspace.getConfiguration('codemap');

  return {
    maxDepth: config.get<number>('maxDepth', 3),
    excludePatterns: config.get<string[]>('excludePatterns', [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/__pycache__/**',
      '**/*.min.*',
    ]),
    autoGenerateOnOpen: config.get<boolean>('autoGenerateOnOpen', true),
    theme: config.get<'dark' | 'light'>('theme', 'dark'),
    maxNodes: config.get<number>('maxNodes', 10000),
  };
}
