let graphData = null;
let simulation = null;
let svg = null;
let zoomG = null;
let linkElements = null;
let nodeElements = null;
let labelElements = null;
let tooltip = null;
let width, height;

const colorMap = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f7df1e',
  'Python': '#3572A5',
  'Go': '#00ADD8',
  'Rust': '#DEA584',
  'Java': '#b07219',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'C': '#555555',
  'C++': '#f34b7d',
  'Swift': '#ffac45',
  'Kotlin': '#F18E33',
  'Vue': '#42b883',
  'Svelte': '#ff3e00',
  'Astro': '#ff5a03',
  'Other': '#888888',
};

function init() {
  width = window.innerWidth;
  height = window.innerHeight - 44;

  svg = d3.select('#graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  zoomG = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      zoomG.attr('transform', event.transform);
    });

  svg.call(zoom);

  tooltip = d3.select('#tooltip');

  d3.select('#resetBtn').on('click', () => {
    svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.pointer(svg.node())
    );
  });

  d3.select('#exportBtn').on('click', exportToPNG);

  d3.select('#search').on('input', filterNodes);

  requestGraphData();
}

function requestGraphData() {
  const vscode = acquireVsCodeApi();
  vscode.postMessage({ command: 'getData' });

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'graphData') {
      graphData = message.data;
      renderGraph();
      updateStats();
    }
  });
}

function renderGraph() {
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    zoomG.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .style('font-size', '16px')
      .text('No files found. Generate a map first.');
    return;
  }

  zoomG.selectAll('*').remove();

  const nodes = graphData.nodes.map(d => ({ ...d }));
  const edges = graphData.edges.map(d => ({ ...d }));

  const maxCentrality = d3.max(nodes, d => d.centrality) || 1;

  const radiusScale = d3.scaleSqrt()
    .domain([0, maxCentrality])
    .range([4, 25]);

  linkElements = zoomG.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('class', d => {
      let cls = 'link';
      if (d.isCircular) cls += ' circular';
      return cls;
    })
    .attr('stroke-width', d => d.isCircular ? 2.5 : 1.5)
    .attr('stroke', d => d.isCircular ? '#f44336' : null);

  nodeElements = zoomG.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', d => {
      let cls = 'node';
      if (d.isEntryPoint) cls += ' entry-point';
      if (d.hasCircularDependency) cls += ' circular';
      if (d.isOrphan) cls += ' orphan';
      return cls;
    })
    .on('click', (event, d) => {
      openFile(d.path);
    })
    .on('mouseenter', showTooltip)
    .on('mousemove', moveTooltip)
    .on('mouseleave', hideTooltip)
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
    );

  nodeElements.append('circle')
    .attr('r', d => radiusScale(d.centrality || 1))
    .attr('fill', d => colorMap[d.language] || '#888')
    .attr('stroke', d => {
      if (d.isEntryPoint) return '#ff9800';
      if (d.hasCircularDependency) return '#f44336';
      return '#fff';
    })
    .attr('stroke-width', d => {
      if (d.isEntryPoint || d.hasCircularDependency) return 3;
      return 1.5;
    });

  nodeElements.append('text')
    .attr('class', 'language-label')
    .attr('dy', d => radiusScale(d.centrality || 1) + 14)
    .attr('fill', d => colorMap[d.language] || '#888')
    .style('font-size', d => Math.max(8, Math.min(12, radiusScale(d.centrality || 1) * 0.6)) + 'px')
    .text(d => d.label.length > 15 ? d.label.slice(0, 12) + '...' : d.label);

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges)
      .id(d => d.id)
      .distance(d => d.isCircular ? 150 : 80)
    )
    .force('charge', d3.forceManyBody().strength(-250))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => radiusScale(d.centrality || 1) + 20))
    .on('tick', ticked);

  const vscode = acquireVsCodeApi();
  window.vscodeApi = vscode;
}

function ticked() {
  linkElements
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  nodeElements
    .attr('transform', d => `translate(${d.x},${d.y})`);
}

function showTooltip(event, d) {
  const deps = d.dependencies ? d.dependencies.length : 0;
  const depBy = d.dependents ? d.dependents.length : 0;
  const circular = d.hasCircularDependency ? ' ⚠ Circular' : '';
  const entry = d.isEntryPoint ? ' ⭐ Entry' : '';
  const orphan = d.isOrphan ? ' 👁 Orphan' : '';

  tooltip
    .style('display', 'block')
    .html(`
      <div class="file-path">${d.label}</div>
      <div class="file-stats">${d.path}</div>
      <div class="file-stats">${d.language} | Deps: ${deps} | Used by: ${depBy}${circular}${entry}${orphan}</div>
    `);
}

function moveTooltip(event) {
  tooltip
    .style('left', (event.offsetX + 12) + 'px')
    .style('top', (event.offsetY - 10) + 'px');
}

function hideTooltip() {
  tooltip.style('display', 'none');
}

function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function filterNodes() {
  const query = d3.select('#search').property('value').toLowerCase();

  nodeElements.style('display', d => {
    if (!query) return null;
    return d.label.toLowerCase().includes(query) || d.path.toLowerCase().includes(query)
      ? null
      : 'none';
  });

  linkElements.style('display', d => {
    if (!query) return null;
    const sourceVisible = d.source && d.source.label && d.source.label.toLowerCase().includes(query);
    const targetVisible = d.target && d.target.label && d.target.label.toLowerCase().includes(query);
    return sourceVisible || targetVisible ? null : 'none';
  });
}

function updateStats() {
  if (!graphData) return;
  const stats = graphData.stats;
  const circular = stats.circularCount > 0
    ? ` | ⚠ ${stats.circularCount} circular`
    : '';
  d3.select('#stats').text(
    `${stats.totalFiles} files | ${stats.totalDependencies} deps${circular}`
  );
}

function openFile(filePath) {
  const vscode = acquireVsCodeApi();
  vscode.postMessage({ command: 'openFile', path: filePath });
}

function exportToPNG() {
  const svgElement = document.querySelector('svg');
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function() {
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);

    const link = document.createElement('a');
    link.download = 'codemap-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    URL.revokeObjectURL(url);
  };

  img.src = url;
}

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight - 44;
  if (svg) {
    svg.attr('width', width).attr('height', height);
  }
  if (simulation) {
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
  }
});

document.addEventListener('DOMContentLoaded', init);
