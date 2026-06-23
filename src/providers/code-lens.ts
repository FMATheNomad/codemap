import * as vscode from 'vscode';
import { DependencyGraph } from '../parser/graph';

export class CodeMapCodeLensProvider implements vscode.CodeLensProvider {
  private graph: DependencyGraph | null = null;
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  refresh(graph: DependencyGraph): void {
    this.graph = graph;
    this._onDidChangeCodeLenses.fire();
  }

  clear(): void {
    this.graph = null;
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    if (!this.graph) return [];

    const relativePath = vscode.workspace.asRelativePath(document.uri);
    const node = this.graph.nodes.get(relativePath);
    if (!node) return [];

    const lenses: vscode.CodeLens[] = [];
    const top = new vscode.Range(0, 0, 0, 0);

    const deps = node.dependencies.length;
    const dependents = node.dependents.length;
    const circular = node.hasCircularDependency ? 1 : 0;
    const entryPoint = node.isEntryPoint ? ' (entry point)' : '';

    const command: vscode.Command = {
      title: `Dependencies: ${deps} | Dependents: ${dependents} | Circular: ${circular}${entryPoint}`,
      command: 'codemap.showDependencies',
      arguments: [relativePath],
    };

    lenses.push(new vscode.CodeLens(top, command));

    return lenses;
  }

  resolveCodeLens?(codeLens: vscode.CodeLens): vscode.CodeLens {
    return codeLens;
  }
}
