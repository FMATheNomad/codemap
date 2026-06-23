import * as assert from 'assert';

suite('Graph Tests', () => {
  test('createEmptyGraph returns correct structure', () => {
    const { createEmptyGraph } = require('../../src/parser/graph');
    const graph = createEmptyGraph();

    assert.strictEqual(graph.nodes.size, 0, 'Should have empty nodes');
    assert.strictEqual(graph.edges.length, 0, 'Should have no edges');
    assert.strictEqual(graph.stats.totalFiles, 0);
    assert.strictEqual(graph.stats.totalDependencies, 0);
    assert.strictEqual(graph.stats.circularCount, 0);
    assert.strictEqual(graph.stats.orphanCount, 0);
    assert.strictEqual(graph.stats.dominantLanguage, 'unknown');
  });

  test('detectCircularDependencies finds cycles', () => {
    const { createEmptyGraph, detectCircularDependencies } = require('../../src/parser/graph');
    const graph = createEmptyGraph();

    graph.nodes.set('a', {
      id: 'a', label: 'a.ts', path: 'a.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: ['b'], dependents: ['c'], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });
    graph.nodes.set('b', {
      id: 'b', label: 'b.ts', path: 'b.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: ['c'], dependents: ['a'], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });
    graph.nodes.set('c', {
      id: 'c', label: 'c.ts', path: 'c.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: ['a'], dependents: ['b'], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });

    graph.edges.push(
      { source: 'a', target: 'b', label: 'depends-on', isCircular: false },
      { source: 'b', target: 'c', label: 'depends-on', isCircular: false },
      { source: 'c', target: 'a', label: 'depends-on', isCircular: false },
    );

    detectCircularDependencies(graph);

    assert.strictEqual(graph.stats.circularCount, 3, 'Should detect circular dependencies');
    assert.ok(graph.nodes.get('a')!.hasCircularDependency, 'Node a should be marked circular');
    assert.ok(graph.nodes.get('b')!.hasCircularDependency, 'Node b should be marked circular');
    assert.ok(graph.nodes.get('c')!.hasCircularDependency, 'Node c should be marked circular');
  });

  test('calculateCentrality gives higher scores to central nodes', () => {
    const { createEmptyGraph, calculateCentrality } = require('../../src/parser/graph');
    const graph = createEmptyGraph();

    graph.nodes.set('main', {
      id: 'main', label: 'main.ts', path: 'main.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: ['util1', 'util2'], dependents: [], isEntryPoint: true,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });
    graph.nodes.set('util1', {
      id: 'util1', label: 'util1.ts', path: 'util1.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: [], dependents: ['main'], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });
    graph.nodes.set('util2', {
      id: 'util2', label: 'util2.ts', path: 'util2.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: [], dependents: ['main'], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });

    graph.edges.push(
      { source: 'main', target: 'util1', label: 'depends-on', isCircular: false },
      { source: 'main', target: 'util2', label: 'depends-on', isCircular: false },
    );

    calculateCentrality(graph);

    const mainCentrality = graph.nodes.get('main')!.centrality;
    const util1Centrality = graph.nodes.get('util1')!.centrality;

    assert.ok(mainCentrality > 0, 'Main should have positive centrality');
    assert.ok(util1Centrality > 0, 'Util1 should have positive centrality');
  });

  test('computeOrphans marks files with no deps as orphans', () => {
    const { createEmptyGraph, computeOrphans } = require('../../src/parser/graph');
    const graph = createEmptyGraph();

    graph.nodes.set('connected', {
      id: 'connected', label: 'c.ts', path: 'c.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: [], dependents: [], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });
    graph.nodes.set('orphan', {
      id: 'orphan', label: 'o.ts', path: 'o.ts', type: 'file', language: 'TypeScript',
      size: 100, dependencies: [], dependents: [], isEntryPoint: false,
      isOrphan: false, hasCircularDependency: false, centrality: 0,
    });

    computeOrphans(graph);

    assert.ok(graph.nodes.get('orphan')!.isOrphan, 'Node with no deps should be orphan');
  });
});
