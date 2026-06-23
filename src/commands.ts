import * as vscode from 'vscode';
import { CodeMapGenerator } from './parser/index';
import { DependencyGraph } from './parser/graph';
import { MapDataProvider } from './providers/map-provider';
import { CodeMapTreeProvider } from './providers/tree-provider';
import { CodeMapCodeLensProvider } from './providers/code-lens';
import { StatusBarManager } from './status/status-bar';
import { withProgress } from './status/progress';
import { getConfig } from './utils/config';

let currentGraph: DependencyGraph | null = null;
let mapPanel: vscode.WebviewPanel | undefined;

export function registerCommands(
  context: vscode.ExtensionContext,
  mapDataProvider: MapDataProvider,
  treeProvider: CodeMapTreeProvider,
  codeLensProvider: CodeMapCodeLensProvider,
  statusBarManager: StatusBarManager
): void {
  const generator = new CodeMapGenerator();

  const generateMap = vscode.commands.registerCommand('codemap.generateMap', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('codemap: No workspace folder open');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const config = getConfig();

    try {
      const graph = await withProgress('codemap: Generating code map...', async (progress) => {
        progress.report({ message: 'Scanning files...' });
        return await generator.generate({
          rootPath,
          maxDepth: config.maxDepth,
          excludePatterns: config.excludePatterns,
          maxNodes: config.maxNodes,
        });
      });

      currentGraph = graph;
      mapDataProvider.setGraph(graph);
      treeProvider.refresh(graph);
      codeLensProvider.refresh(graph);
      statusBarManager.update(graph);

      showMapPanel(context, mapDataProvider);

      vscode.window.showInformationMessage(
        `codemap: Map generated — ${graph.stats.totalFiles} files, ${graph.stats.totalDependencies} dependencies`
      );

      if (graph.stats.circularCount > 0) {
        vscode.window.showWarningMessage(
          `codemap: Found ${graph.stats.circularCount} circular ${graph.stats.circularCount === 1 ? 'dependency' : 'dependencies'}`
        );
      }
    } catch (err) {
      vscode.window.showErrorMessage(`codemap: Error generating map — ${err}`);
    }
  });

  const refreshMap = vscode.commands.registerCommand('codemap.refreshMap', async () => {
    await vscode.commands.executeCommand('codemap.generateMap');
  });

  const findCircular = vscode.commands.registerCommand('codemap.findCircular', () => {
    if (!currentGraph) {
      vscode.window.showInformationMessage('codemap: Generate a map first');
      return;
    }

    const circularNodes = Array.from(currentGraph.nodes.values())
      .filter(n => n.hasCircularDependency)
      .map(n => n.path);

    if (circularNodes.length === 0) {
      vscode.window.showInformationMessage('codemap: No circular dependencies found!');
      return;
    }

    const items = circularNodes.map(p => ({
      label: p,
      description: 'circular dependency',
    }));

    vscode.window.showQuickPick(items, {
      placeHolder: `${circularNodes.length} circular ${circularNodes.length === 1 ? 'dependency' : 'dependencies'} found. Select to open.`,
    }).then(selected => {
      if (selected) {
        openFile(selected.label);
      }
    });
  });

  const exportMap = vscode.commands.registerCommand('codemap.exportMap', async () => {
    if (!currentGraph) {
      vscode.window.showInformationMessage('codemap: Generate a map first');
      return;
    }

    const options: vscode.SaveDialogOptions = {
      filters: {
        'JSON files': ['json'],
        'All files': ['*'],
      },
      defaultUri: vscode.Uri.file('codemap-export.json'),
    };

    const uri = await vscode.window.showSaveDialog(options);
    if (!uri) return;

    const graphData = {
      nodes: Array.from(currentGraph.nodes.values()),
      edges: currentGraph.edges,
      stats: currentGraph.stats,
    };

    try {
      const fs = require('fs');
      fs.writeFileSync(uri.fsPath, JSON.stringify(graphData, null, 2));
      vscode.window.showInformationMessage(`codemap: Exported to ${uri.fsPath}`);
    } catch (err) {
      vscode.window.showErrorMessage(`codemap: Export failed — ${err}`);
    }
  });

  const toggleMap = vscode.commands.registerCommand('codemap.toggleMap', () => {
    if (mapPanel) {
      mapPanel.dispose();
      mapPanel = undefined;
    } else {
      if (currentGraph) {
        showMapPanel(context, mapDataProvider);
      } else {
        vscode.commands.executeCommand('codemap.generateMap');
      }
    }
  });

  const openInMap = vscode.commands.registerCommand('codemap.openInMap', async (uri?: vscode.Uri) => {
    const fileUri = uri || vscode.window.activeTextEditor?.document.uri;
    if (!fileUri) return;

    if (!currentGraph) {
      await vscode.commands.executeCommand('codemap.generateMap');
    }

    const relativePath = vscode.workspace.asRelativePath(fileUri);
    if (mapPanel) {
      mapPanel.webview.postMessage({ command: 'focusFile', path: relativePath });
    }
  });

  const showDependencies = vscode.commands.registerCommand('codemap.showDependencies', (filePath?: string) => {
    const targetPath = filePath || vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!targetPath || !currentGraph) return;

    const relativePath = vscode.workspace.asRelativePath(targetPath);
    const node = currentGraph.nodes.get(relativePath);

    if (!node) {
      vscode.window.showInformationMessage(`codemap: No data for "${relativePath}"`);
      return;
    }

    const deps = node.dependencies.filter(d => currentGraph!.nodes.has(d));
    const dependents = node.dependents.filter(d => currentGraph!.nodes.has(d));

    const depItems = deps.map(d => ({
      label: d,
      description: 'dependency',
    }));
    const depByItems = dependents.map(d => ({
      label: d,
      description: 'dependent',
    }));

    const separator = { label: '---', kind: vscode.QuickPickItemKind.Separator } as const;
    const allItems = [...depItems, separator, ...depByItems];

    vscode.window.showQuickPick(allItems, {
      placeHolder: `${deps.length} dependencies, ${dependents.length} dependents for ${relativePath}`,
    }).then(selected => {
      if (selected && 'description' in selected) {
        openFile(selected.label);
      }
    });
  });

  const focusFile = vscode.commands.registerCommand('codemap.focusFile', (filePath: string) => {
    openFile(filePath);
  });

  context.subscriptions.push(
    generateMap, refreshMap, findCircular, exportMap,
    toggleMap, openInMap, showDependencies, focusFile
  );
}

function showMapPanel(context: vscode.ExtensionContext, mapDataProvider: MapDataProvider): void {
  if (mapPanel) {
    mapPanel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  mapPanel = vscode.window.createWebviewPanel(
    'codemap.map',
    'Code Map',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'webview')],
    }
  );

  const scriptUri = mapPanel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'webview', 'script.js')
  );
  const styleUri = mapPanel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'webview', 'style.css')
  );
  const d3Uri = mapPanel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'src', 'views', 'webview', 'd3.min.js')
  );

  mapPanel.webview.html = getWebviewHtml(mapPanel.webview, scriptUri, styleUri, d3Uri);

  mapPanel.webview.onDidReceiveMessage(message => {
    switch (message.command) {
      case 'openFile':
        openFile(message.path);
        break;
      case 'getData':
        const data = mapDataProvider.getGraphData();
        if (data) {
          mapPanel!.webview.postMessage({ command: 'graphData', data });
        }
        break;
      case 'exportPNG':
        break;
    }
  });

  mapPanel.onDidDispose(() => {
    mapPanel = undefined;
  });
}

function getWebviewHtml(webview: vscode.Webview, scriptUri: vscode.Uri, styleUri: vscode.Uri, d3Uri: vscode.Uri): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline'; img-src 'self' data:;">
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
  <script src="${d3Uri}"></script>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}

function openFile(filePath: string): void {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
  vscode.window.showTextDocument(uri).then(undefined, () => {
    // file might not exist
  });
}
