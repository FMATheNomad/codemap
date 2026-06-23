import * as vscode from 'vscode';
import * as path from 'path';
import { DependencyGraph, GraphNode } from '../parser/graph';

export class CodeMapTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private graph: DependencyGraph | null = null;
  private treeNodes: TreeNode[] = [];

  refresh(graph: DependencyGraph): void {
    this.graph = graph;
    this.buildTree();
    this._onDidChangeTreeData.fire(undefined);
  }

  clear(): void {
    this.graph = null;
    this.treeNodes = [];
    this._onDidChangeTreeData.fire(undefined);
  }

  private buildTree(): void {
    if (!this.graph) {
      this.treeNodes = [];
      return;
    }

    const tree = new Map<string, TreeNode[]>();
    const roots: TreeNode[] = [];

    for (const node of this.graph.nodes.values()) {
      const parts = node.path.split('/');
      if (parts.length === 1) {
        roots.push(this.createTreeNode(node));
      } else {
        const dir = parts.slice(0, -1).join('/');
        if (!tree.has(dir)) {
          tree.set(dir, []);
        }
        tree.get(dir)!.push(this.createTreeNode(node));
      }
    }

    this.treeNodes = this.buildHierarchy(tree, roots, '');
  }

  private createTreeNode(node: GraphNode): TreeNode {
    const circular = node.hasCircularDependency ? ' $(warning) ' : '';
    const entryPoint = node.isEntryPoint ? ' $(star) ' : '';
    const orphan = node.isOrphan ? ' $(eye-closed) ' : '';
    const depCount = node.dependencies.length;
    const label = `${node.label}${circular}${entryPoint}${orphan}`;

    return new TreeNode(
      label,
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'codemap.focusFile',
        title: 'Open File',
        arguments: [node.path],
      },
      node
    );
  }

  private buildHierarchy(
    tree: Map<string, TreeNode[]>,
    roots: TreeNode[],
    prefix: string
  ): TreeNode[] {
    const result: TreeNode[] = [];

    const dirs = new Set<string>();
    for (const key of tree.keys()) {
      if (key.startsWith(prefix)) {
        const remainder = key.slice(prefix.length);
        const dirName = remainder.split('/')[0];
        if (dirName && !dirs.has(dirName)) {
          dirs.add(dirName);
          const dirNode = new TreeNode(
            dirName,
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            undefined
          );
          dirNode.iconPath = vscode.ThemeIcon.Folder;
          result.push(dirNode);
        }
      }
    }

    result.push(...roots);
    return result;
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): Thenable<TreeNode[]> {
    if (!element) {
      return Promise.resolve(this.treeNodes);
    }
    return Promise.resolve([]);
  }
}

export class TreeNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly node?: GraphNode
  ) {
    super(label, collapsibleState);

    if (node) {
      this.tooltip = `${node.path}\nDependencies: ${node.dependencies.length}\nDependents: ${node.dependents.length}`;
      this.description = node.language;

      if (node.hasCircularDependency) {
        this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('errorForeground'));
      } else if (node.isEntryPoint) {
        this.iconPath = new vscode.ThemeIcon('star', new vscode.ThemeColor('chartYellow'));
      } else {
        this.iconPath = new vscode.ThemeIcon('file');
      }

      this.contextValue = 'fileNode';
    }
  }
}
