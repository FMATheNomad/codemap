import * as vscode from 'vscode';
import { DependencyGraph, GraphNode } from '../parser/graph';

export class MapDataProvider {
  private graph: DependencyGraph | null = null;

  setGraph(graph: DependencyGraph): void {
    this.graph = graph;
  }

  clear(): void {
    this.graph = null;
  }

  getGraph(): DependencyGraph | null {
    return this.graph;
  }

  getGraphData(): GraphData | null {
    if (!this.graph) return null;

    const nodes = Array.from(this.graph.nodes.values()).map(node => ({
      id: node.id,
      label: node.label,
      path: node.path,
      language: node.language,
      size: node.size,
      dependencies: node.dependencies,
      dependents: node.dependents,
      isEntryPoint: node.isEntryPoint,
      isOrphan: node.isOrphan,
      hasCircularDependency: node.hasCircularDependency,
      centrality: node.centrality,
    }));

    const edges = this.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.label,
      isCircular: edge.isCircular,
    }));

    return {
      nodes,
      edges,
      stats: this.graph.stats,
    };
  }

  getFileNode(filePath: string): GraphNode | null {
    if (!this.graph) return null;
    return this.graph.nodes.get(filePath) || null;
  }
}

export interface GraphData {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  stats: {
    totalFiles: number;
    totalDependencies: number;
    circularCount: number;
    orphanCount: number;
    dominantLanguage: string;
  };
}

interface SerializedNode {
  id: string;
  label: string;
  path: string;
  language: string;
  size: number;
  dependencies: string[];
  dependents: string[];
  isEntryPoint: boolean;
  isOrphan: boolean;
  hasCircularDependency: boolean;
  centrality: number;
}

interface SerializedEdge {
  source: string;
  target: string;
  label?: string;
  isCircular: boolean;
}
