import { describe, it, expect } from 'vitest';
import { Graph3D } from '../src/core/Graph3D';
import type { GraphData } from '../src/utils/types';

describe('Graph3D', () => {
  const mockData: GraphData = {
    type: 'directed',
    nodes: [
      { id: '1', label: 'Node 1' },
      { id: '2', label: 'Node 2' },
    ],
    edges: [
      { from: '1', to: '2' },
    ],
  };

  it('should initialize without error', () => {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    expect(() => {
      new Graph3D({
        container,
        data: mockData,
      });
    }).not.toThrow();

    document.body.removeChild(container);
  });
}); 