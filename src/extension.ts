import * as vscode from 'vscode';
import { activate as activateImpl, deactivate as deactivateImpl } from './activate';

export function activate(context: vscode.ExtensionContext): void {
  activateImpl(context);
}

export function deactivate(): void {
  deactivateImpl();
}
