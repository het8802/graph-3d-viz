import type { Node, Edge, GraphType } from '../utils/types';
import * as d3 from 'd3';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  z?: number;
}

interface D3Edge extends d3.SimulationLinkDatum<D3Node> {
  source: string;
  target: string;
  from: string;
  to: string;
  weight?: number;
}

export class LayoutEngine {
  private nodes: Node[];
  private edges: Edge[];
  private type: GraphType;

  constructor(nodes: Node[], edges: Edge[], type: GraphType) {
    this.nodes = nodes;
    this.edges = edges;
    this.type = type;
  }

  private createForceSimulation(): d3.Simulation<D3Node, D3Edge> {
    const d3Nodes: D3Node[] = this.nodes.map(node => ({ id: node.id }));
    const d3Edges: D3Edge[] = this.edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
    }));

    // Calculate optimal edge length based on number of nodes
    const baseLength = 50; // Base length for small graphs
    const lengthScale = Math.max(1, Math.log10(this.nodes.length)); // Scale factor based on node count
    const optimalLength = baseLength / lengthScale;

    const simulation = d3.forceSimulation(d3Nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter())
      .force('link', d3.forceLink(d3Edges)
        .id((d: d3.SimulationNodeDatum) => (d as D3Node).id)
        .distance(optimalLength)
      );

    // Adjust collision radius based on edge length
    simulation.force('collision', d3.forceCollide().radius(optimalLength * 0.5));

    return simulation;
  }

  private createTreeLayout(): d3.HierarchyPointNode<D3Node> {
    const rootNode: D3Node = { id: this.nodes[0].id };
    const hierarchy = d3.hierarchy(rootNode, (d: D3Node) => {
      return this.edges
        .filter(e => e.from === d.id)
        .map(e => ({ id: e.to } as D3Node));
    });

    const treeLayout = d3.tree<D3Node>()
      .size([2 * Math.PI, 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    return treeLayout(hierarchy);
  }

  public calculateLayout(): Node[] {
    let positionedNodes: Node[] = [];

    switch (this.type) {
      case 'tree':
      case 'DAG': {
        const root = this.findRoot();
        if (!root) {
          throw new Error('No root node found for tree/DAG layout');
        }
        const tree = this.createTreeLayout();
        positionedNodes = tree.descendants().map((node: d3.HierarchyPointNode<D3Node>) => {
          const originalNode = this.nodes.find(n => n.id === node.data.id);
          if (!originalNode) {
            throw new Error(`Node ${node.data.id} not found`);
          }
          return {
            ...originalNode,
            position: [
              node.x * Math.cos(node.y),
              node.y,
              node.x * Math.sin(node.y),
            ] as [number, number, number],
          };
        });
        break;
      }

      default: {
        const simulation = this.createForceSimulation();
        simulation.stop();
        simulation.tick(300);

        positionedNodes = this.nodes.map(node => {
          const d3Node = simulation.nodes().find(n => (n as D3Node).id === node.id);
          return {
            ...node,
            position: [
              d3Node?.x ?? 0,
              d3Node?.y ?? 0,
              d3Node?.z ?? 0,
            ] as [number, number, number],
          };
        });
        break;
      }
    }

    return positionedNodes;
  }

  private findRoot(): Node | undefined {
    if (this.type === 'tree' || this.type === 'DAG') {
      const hasIncomingEdge = new Set(this.edges.map(e => e.to));
      
      for (const node of this.nodes) {
        if (!hasIncomingEdge.has(node.id)) {
          return node;
        }
      }
    }
    return undefined;
  }
}
