import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Node, Edge, GraphConfig } from '../utils/types';

export class GraphRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private config: GraphConfig;
  private nodeMeshes: Map<string, THREE.Mesh>;
  private edgeLines: Map<string, THREE.Line>;

  constructor(config: GraphConfig) {
    this.config = config;
    this.nodeMeshes = new Map();
    this.edgeLines = new Map();

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.theme === 'dark' ? 0x111111 : 0xffffff);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.config.container.clientWidth, this.config.container.clientHeight);
    this.config.container.appendChild(this.renderer.domElement);

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(ambientLight, directionalLight);

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize(): void {
    const width = this.config.container.clientWidth;
    const height = this.config.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private createNodeMesh(node: Node): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(this.config.nodeSize || 0.2, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: node.color || (this.config.theme === 'dark' ? 0x4a90e2 : 0x1a73e8),
    });
    const mesh = new THREE.Mesh(geometry, material);

    if (node.position) {
      mesh.position.set(...node.position);
    }

    // Add label if exists
    if (node.label) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '12px Arial';
        context.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
        context.fillText(node.label, 0, 12);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.position.y = 0.3;
        mesh.add(label);
      }
    }

    return mesh;
  }

  private createEdgeLine(edge: Edge, nodes: Map<string, Node>): THREE.Line {
    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);

    if (!fromNode || !toNode) {
      throw new Error(`Invalid edge: nodes ${edge.from} or ${edge.to} not found`);
    }

    const fromPos = fromNode.position || [0, 0, 0];
    const toPos = toNode.position || [0, 0, 0];

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(...toPos),
    ]);

    const material = new THREE.LineBasicMaterial({
      color: edge.color || (this.config.theme === 'dark' ? 0x666666 : 0x999999),
      linewidth: this.config.edgeWidth || 1,
    });

    return new THREE.Line(geometry, material);
  }

  public render(data: { nodes: Node[]; edges: Edge[] }): void {
    // Clear existing meshes and lines
    for (const mesh of this.nodeMeshes.values()) {
      this.scene.remove(mesh);
    }
    for (const line of this.edgeLines.values()) {
      this.scene.remove(line);
    }
    this.nodeMeshes.clear();
    this.edgeLines.clear();

    // Create node map for quick lookup
    const nodeMap = new Map(data.nodes.map(node => [node.id, node]));

    // Create and add nodes
    for (const node of data.nodes) {
      const mesh = this.createNodeMesh(node);
      this.nodeMeshes.set(node.id, mesh);
      this.scene.add(mesh);
    }

    // Create and add edges
    for (const edge of data.edges) {
      const line = this.createEdgeLine(edge, nodeMap);
      this.edgeLines.set(`${edge.from}-${edge.to}`, line);
      this.scene.add(line);
    }

    // Center camera on the graph
    const box = new THREE.Box3().setFromObject(this.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / Math.tan(fov / 2)) * 1.5;

    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.controls.target.copy(center);
    this.controls.update();
  }

  public animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    this.controls.dispose();
  }
}
