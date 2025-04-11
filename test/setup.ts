import { vi } from 'vitest';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn().mockImplementation(() => ({
    background: null,
    add: vi.fn(),
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { z: 0 },
    aspect: 0,
    fov: 0,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    domElement: document.createElement('canvas'),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
  AmbientLight: vi.fn(),
  DirectionalLight: vi.fn(),
  SphereGeometry: vi.fn(),
  MeshPhongMaterial: vi.fn(),
  Mesh: vi.fn(),
  BufferGeometry: vi.fn(),
  LineBasicMaterial: vi.fn(),
  Line: vi.fn(),
  Box3: vi.fn().mockImplementation(() => ({
    setFromObject: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    getSize: vi.fn().mockReturnValue({ x: 1, y: 1, z: 1 }),
  })),
  Vector3: vi.fn(),
  Color: vi.fn(),
}));

// Mock Three.js OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: vi.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));

// Mock D3.js
vi.mock('d3', () => ({
  forceSimulation: vi.fn().mockReturnValue({
    force: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    tick: vi.fn(),
    nodes: vi.fn().mockReturnValue([]),
  }),
  forceManyBody: vi.fn(),
  forceCenter: vi.fn(),
  forceLink: vi.fn(),
  forceCollide: vi.fn(),
  hierarchy: vi.fn(),
  tree: vi.fn(),
})); 