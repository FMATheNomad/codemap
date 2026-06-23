export interface GraphNode {
  id: string;
  label: string;
  path: string;
  type: 'file' | 'directory';
  language: string;
  size: number;
  dependencies: string[];
  dependents: string[];
  isEntryPoint: boolean;
  isOrphan: boolean;
  hasCircularDependency: boolean;
  centrality: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  isCircular: boolean;
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  stats: {
    totalFiles: number;
    totalDependencies: number;
    circularCount: number;
    orphanCount: number;
    dominantLanguage: string;
  };
}

export function createEmptyGraph(): DependencyGraph {
  return {
    nodes: new Map(),
    edges: [],
    stats: {
      totalFiles: 0,
      totalDependencies: 0,
      circularCount: 0,
      orphanCount: 0,
      dominantLanguage: 'unknown',
    },
  };
}

export function detectCircularDependencies(graph: DependencyGraph): void {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circular: string[] = [];

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      circular.push(nodeId);
      return true;
    }
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const depId of node.dependencies) {
        if (graph.nodes.has(depId)) {
          dfs(depId);
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  for (const nodeId of circular) {
    const node = graph.nodes.get(nodeId);
    if (node) {
      node.hasCircularDependency = true;
    }
  }

  for (const edge of graph.edges) {
    const sourceNode = graph.nodes.get(edge.source);
    const targetNode = graph.nodes.get(edge.target);
    if (sourceNode?.hasCircularDependency || targetNode?.hasCircularDependency) {
      edge.isCircular = true;
    }
  }

  graph.stats.circularCount = circular.length;
}

export function calculateCentrality(graph: DependencyGraph): void {
  const damping = 0.85;
  const maxIterations = 100;
  const convergenceThreshold = 0.0001;
  const nodeIds = Array.from(graph.nodes.keys());
  const n = nodeIds.length;

  if (n === 0) return;

  let ranks = new Map<string, number>();
  for (const id of nodeIds) {
    ranks.set(id, 1 / n);
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const newRanks = new Map<string, number>();
    let maxDiff = 0;

    for (const id of nodeIds) {
      const node = graph.nodes.get(id)!;
      let sum = 0;
      for (const depId of node.dependents) {
        const depNode = graph.nodes.get(depId);
        if (depNode && depNode.dependencies.length > 0) {
          sum += (ranks.get(depId) || 0) / depNode.dependencies.length;
        }
      }
      const newRank = (1 - damping) / n + damping * sum;
      newRanks.set(id, newRank);
      maxDiff = Math.max(maxDiff, Math.abs(newRank - (ranks.get(id) || 0)));
    }

    ranks = newRanks;
    if (maxDiff < convergenceThreshold) break;
  }

  for (const id of nodeIds) {
    const node = graph.nodes.get(id)!;
    node.centrality = ranks.get(id) || 0;
  }
}

export function computeOrphans(graph: DependencyGraph): void {
  for (const node of graph.nodes.values()) {
    if (node.dependencies.length === 0 && node.dependents.length === 0 && !node.isEntryPoint) {
      node.isOrphan = true;
    }
  }
  graph.stats.orphanCount = Array.from(graph.nodes.values()).filter(n => n.isOrphan).length;
}

export function computeStats(graph: DependencyGraph): void {
  graph.stats.totalFiles = graph.nodes.size;
  graph.stats.totalDependencies = graph.edges.length;

  const langCount = new Map<string, number>();
  for (const node of graph.nodes.values()) {
    langCount.set(node.language, (langCount.get(node.language) || 0) + 1);
  }
  let maxLang = 'unknown';
  let maxCount = 0;
  for (const [lang, count] of langCount) {
    if (count > maxCount) {
      maxCount = count;
      maxLang = lang;
    }
  }
  graph.stats.dominantLanguage = maxLang;
}
