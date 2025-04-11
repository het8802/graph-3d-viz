import { describe, it, expect } from 'vitest';
import { Graph3D } from '../src/core/Graph3D';

describe('Graph3D', () => {
  it('should initialize without error', () => {
    const mockContainer = document.createElement('div');
    const mockData = {
      type: 'directed' as const,
      nodes: [{ id: 'A' }],
      edges: [],
    };

    expect(() => {
      new Graph3D({
        container: mockContainer,
        data: mockData,
      });
    }).not.toThrow();
  });
}); 