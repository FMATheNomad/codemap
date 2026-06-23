import * as vscode from 'vscode';
import { DependencyGraph } from '../parser/graph';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.command = 'codemap.generateMap';
    this.statusBarItem.tooltip = 'Click to generate code map';
    this.statusBarItem.text = '$(graph) codemap';
    this.statusBarItem.show();
  }

  update(graph: DependencyGraph | null): void {
    if (!graph) {
      this.statusBarItem.text = '$(graph) codemap';
      return;
    }

    const circular = graph.stats.circularCount;
    const warning = circular > 0 ? ` $(warning)` : '';
    this.statusBarItem.text = `$(graph) codemap: ${graph.stats.totalFiles} files | ${graph.stats.totalDependencies} deps${warning}`;

    if (circular > 0) {
      this.statusBarItem.tooltip = `${circular} circular ${circular === 1 ? 'dependency' : 'dependencies'} found!`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.statusBarItem.tooltip = 'No circular dependencies found';
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
