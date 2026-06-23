import * as vscode from 'vscode';
import { CodeMapTreeProvider } from '../providers/tree-provider';

export class TreeViewController {
  private treeView: vscode.TreeView<any>;

  constructor(private treeProvider: CodeMapTreeProvider) {
    this.treeView = vscode.window.createTreeView('codemap.tree', {
      treeDataProvider: treeProvider,
      showCollapseAll: true,
    });

    this.treeView.onDidChangeSelection(e => {
      if (e.selection.length > 0) {
        const item = e.selection[0] as any;
        if (item.command) {
          vscode.commands.executeCommand(item.command.command, ...(item.command.arguments || []));
        }
      }
    });
  }

  revealItem(filePath: string): void {
    // Find and reveal node by file path
  }

  dispose(): void {
    this.treeView.dispose();
  }
}
