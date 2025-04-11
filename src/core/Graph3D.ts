import type { GraphConfig, GraphData } from '../utils/types';
import { GraphRenderer } from './GraphRenderer';
import { LayoutEngine } from '../layouts/LayoutEngine';

export class Graph3D {
  private renderer: GraphRenderer;
  private layoutEngine: LayoutEngine;
  private config: GraphConfig;

  constructor(config: GraphConfig) {
    this.config = config;
    this.renderer = new GraphRenderer(config);
    this.layoutEngine = new LayoutEngine(
      config.data.nodes,
      config.data.edges,
      config.data.type
    );
  }

  public render(): void {
    // Calculate node positions
    const positionedNodes = this.layoutEngine.calculateLayout();

    // Update node positions in the data
    const updatedData = {
      nodes: positionedNodes,
      edges: this.config.data.edges,
    };

    // Render the graph
    this.renderer.render(updatedData);
    this.renderer.animate();
  }

  public updateData(data: GraphData): void {
    this.config.data = data;
    this.layoutEngine = new LayoutEngine(
      data.nodes,
      data.edges,
      data.type
    );
    this.render();
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}
