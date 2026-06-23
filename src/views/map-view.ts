import * as vscode from 'vscode';
import { MapDataProvider, GraphData } from '../providers/map-provider';

export class MapViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codemap.map';
  private _view?: vscode.WebviewView;
  private mapDataProvider: MapDataProvider;

  constructor(private readonly extensionUri: vscode.Uri, mapDataProvider: MapDataProvider) {
    this.mapDataProvider = mapDataProvider;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'openFile':
          this.openFile(message.path);
          break;
        case 'getData':
          this.sendGraphData();
          break;
        case 'exportPNG':
          break;
      }
    });
  }

  private sendGraphData(): void {
    const data = this.mapDataProvider.getGraphData();
    if (data && this._view) {
      this._view.webview.postMessage({ command: 'graphData', data });
    }
  }

  refresh(): void {
    this.sendGraphData();
  }

  private openFile(filePath: string): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
    vscode.window.showTextDocument(uri);
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'src', 'views', 'webview', 'script.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'src', 'views', 'webview', 'style.css')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'unsafe-inline' https://d3js.org; connect-src https://d3js.org;">
  <link rel="stylesheet" href="${styleUri}">
  <title>codemap</title>
</head>
<body>
  <div id="toolbar">
    <input id="search" type="text" placeholder="Search files..." />
    <button id="resetBtn" title="Reset View">⟲</button>
    <button id="exportBtn" title="Export as PNG">⬇</button>
    <span id="stats">0 files | 0 dependencies</span>
  </div>
  <div id="graph"></div>
  <div id="tooltip" style="display:none;"></div>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
