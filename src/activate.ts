import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { CodeMapTreeProvider } from './providers/tree-provider';
import { MapDataProvider } from './providers/map-provider';
import { CodeMapCodeLensProvider } from './providers/code-lens';
import { StatusBarManager } from './status/status-bar';
import { TreeViewController } from './views/tree-view';
import { getConfig } from './utils/config';

export function activate(context: vscode.ExtensionContext): void {
  const mapDataProvider = new MapDataProvider();
  const treeProvider = new CodeMapTreeProvider();
  const codeLensProvider = new CodeMapCodeLensProvider();
  const statusBarManager = new StatusBarManager();

  const treeViewController = new TreeViewController(treeProvider);

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file' },
      codeLensProvider
    )
  );

  registerCommands(context, mapDataProvider, treeProvider, codeLensProvider, statusBarManager);

  context.subscriptions.push(
    treeViewController,
    statusBarManager
  );

  const config = getConfig();
  if (config.autoGenerateOnOpen && vscode.workspace.workspaceFolders?.length) {
    vscode.commands.executeCommand('codemap.generateMap');
  }
}

export function deactivate(): void {
  // Cleanup handled by context.subscriptions
}
