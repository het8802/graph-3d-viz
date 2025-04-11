# Graph 3D Visualization

A powerful 3D graph visualization library for data structures and algorithms, built with Three.js and D3.js.

## Features

- 3D rendering of various graph types (directed, undirected, trees, DAGs)
- Interactive camera controls (rotate, pan, zoom)
- Force-directed and hierarchical layouts
- Customizable node and edge styles
- Dark/light theme support
- TypeScript support

## Installation

```bash
npm install graph-3d-viz
```

## Usage

```typescript
import { Graph3D } from 'graph-3d-viz';

// Create a container element
const container = document.getElementById('graph-container');

// Define your graph data
const graphData = {
  type: 'directed',
  nodes: [
    { id: 'A', label: 'Node A' },
    { id: 'B', label: 'Node B' },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 5 },
  ],
};

// Create and configure the graph
const graph = new Graph3D({
  container,
  data: graphData,
  theme: 'dark',
  nodeSize: 0.2,
  edgeWidth: 1,
  onNodeClick: (node) => console.log('Node clicked:', node),
  onEdgeClick: (edge) => console.log('Edge clicked:', edge),
});

// Render the graph
graph.render();

// Update graph data
graph.updateData(newGraphData);

// Clean up when done
graph.dispose();
```

## API Reference

### Graph3D

The main class for creating and managing 3D graph visualizations.

#### Constructor

```typescript
new Graph3D(config: GraphConfig)
```

#### Methods

- `render()`: Renders the graph in the container
- `updateData(data: GraphData)`: Updates the graph data and re-renders
- `dispose()`: Cleans up resources

### GraphConfig

Configuration object for the Graph3D instance.

```typescript
interface GraphConfig {
  container: HTMLElement;
  data: GraphData;
  theme?: 'light' | 'dark';
  nodeSize?: number;
  edgeWidth?: number;
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  onNodeHover?: (node: Node | null) => void;
  onEdgeHover?: (edge: Edge | null) => void;
}
```

### GraphData

Data structure for defining the graph.

```typescript
interface GraphData {
  type: GraphType;
  nodes: Node[];
  edges: Edge[];
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the package
npm run build

# Type checking
npm run type-check
```

## License

MIT
