import { vi } from 'vitest';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn(),
  AmbientLight: vi.fn(),
  DirectionalLight: vi.fn(),
  SphereGeometry: vi.fn(),
  MeshPhongMaterial: vi.fn(),
  Mesh: vi.fn(),
  BufferGeometry: vi.fn(),
  LineBasicMaterial: vi.fn(),
  Line: vi.fn(),
  Box3: vi.fn(),
  Vector3: vi.fn(),
  Color: vi.fn(),
}));

// Mock Three.js OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: vi.fn(),
}));

// Mock D3.js
vi.mock('d3', () => ({
  forceSimulation: vi.fn(),
  forceManyBody: vi.fn(),
  forceCenter: vi.fn(),
  forceLink: vi.fn(),
  forceCollide: vi.fn(),
  hierarchy: vi.fn(),
  tree: vi.fn(),
})); 