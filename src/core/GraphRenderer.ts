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
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredNode: THREE.Mesh | null;
  private hoveredEdge: THREE.Line | null;

  constructor(config: GraphConfig) {
    this.config = config;
    this.nodeMeshes = new Map();
    this.edgeLines = new Map();
    this.hoveredNode = null;
    this.hoveredEdge = null;

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

    // Initialize raycaster for hover detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(ambientLight, directionalLight);

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle mouse move for hover detection
    this.config.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.config.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.config.container.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.config.container.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check for node intersections
    const nodeIntersects = this.raycaster.intersectObjects(Array.from(this.nodeMeshes.values()));
    const edgeIntersects = this.raycaster.intersectObjects(Array.from(this.edgeLines.values()));

    // Handle node hover
    if (nodeIntersects.length > 0) {
      const node = nodeIntersects[0].object as THREE.Mesh;
      if (this.hoveredNode !== node) {
        if (this.hoveredNode) {
          (this.hoveredNode.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
        }
        this.hoveredNode = node;
        (node.material as THREE.MeshPhongMaterial).emissive.setHex(0x333333);
        if (this.config.onNodeHover) {
          const nodeId = Array.from(this.nodeMeshes.entries()).find(([_, mesh]) => mesh === node)?.[0];
          if (nodeId) {
            this.config.onNodeHover({ id: nodeId });
          }
        }
      }
    } else if (this.hoveredNode) {
      (this.hoveredNode.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
      this.hoveredNode = null;
      if (this.config.onNodeHover) {
        this.config.onNodeHover(null);
      }
    }

    // Handle edge hover
    if (edgeIntersects.length > 0) {
      const edge = edgeIntersects[0].object as THREE.Line;
      if (this.hoveredEdge !== edge) {
        if (this.hoveredEdge) {
          (this.hoveredEdge.material as THREE.LineBasicMaterial).color.setHex(this.config.theme === 'dark' ? 0x666666 : 0x999999);
        }
        this.hoveredEdge = edge;
        (edge.material as THREE.LineBasicMaterial).color.setHex(0xff0000);
        if (this.config.onEdgeHover) {
          const edgeKey = Array.from(this.edgeLines.entries()).find(([_, line]) => line === edge)?.[0];
          if (edgeKey) {
            const [from, to] = edgeKey.split('-');
            this.config.onEdgeHover({ from, to });
          }
        }
      }
    } else if (this.hoveredEdge) {
      (this.hoveredEdge.material as THREE.LineBasicMaterial).color.setHex(this.config.theme === 'dark' ? 0x666666 : 0x999999);
      this.hoveredEdge = null;
      if (this.config.onEdgeHover) {
        this.config.onEdgeHover(null);
      }
    }
  }

  private handleResize(): void {
    const width = this.config.container.clientWidth;
    const height = this.config.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private calculateNodeSize(nodes: Node[]): number {
    // Calculate base size based on number of nodes and graph dimensions
    const minSize = 0.3; // Minimum node size
    const maxSize = 1.0; // Maximum node size
    
    // Calculate the optimal size based on the number of nodes
    // Using a logarithmic scale to handle both small and large graphs
    const logScale = Math.log10(nodes.length + 1);
    const densityFactor = 1 / (1 + logScale);
    
    // Calculate the base size with a minimum threshold
    const baseSize = Math.max(minSize, maxSize * densityFactor);
    
    // Apply the user's nodeSize preference if provided
    return baseSize * (this.config.nodeSize || 1);
  }

  private createNodeMesh(node: Node, nodeSize: number): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(nodeSize, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: node.color || (this.config.theme === 'dark' ? 0x4a90e2 : 0x1a73e8),
      emissive: new THREE.Color(0x000000),
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
        // Make canvas size proportional to node size
        const canvasSize = Math.max(256, nodeSize * 100);
        canvas.width = canvasSize;
        canvas.height = canvasSize / 2;
        
        // Scale context for high DPI displays
        const scale = window.devicePixelRatio;
        context.scale(scale, scale);
        
        // Set font size based on node size
        const fontSize = Math.max(16, nodeSize * 20);
        context.font = `${fontSize}px Arial`;
        context.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw text in the center of the canvas
        context.fillText(node.label, canvas.width / (2 * scale), canvas.height / (2 * scale));
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
        });
        const label = new THREE.Sprite(labelMaterial);
        
        // Scale label based on node size
        const labelScale = nodeSize * 3;
        label.scale.set(labelScale, labelScale, 1);
        
        // Position label above the node
        label.position.y = nodeSize * 2;
        mesh.add(label);
      }
    }

    return mesh;
  }

  private createEdgeLine(edge: Edge, nodes: Map<string, Node>, nodeSize: number): THREE.Line {
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
      linewidth: (this.config.edgeWidth || 1) * nodeSize,
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

    // Calculate dynamic node size based on graph density
    const nodeSize = this.calculateNodeSize(data.nodes);

    // Create node map for quick lookup
    const nodeMap = new Map(data.nodes.map(node => [node.id, node]));

    // Create and add nodes
    for (const node of data.nodes) {
      const mesh = this.createNodeMesh(node, nodeSize);
      this.nodeMeshes.set(node.id, mesh);
      this.scene.add(mesh);
    }

    // Create and add edges
    for (const edge of data.edges) {
      const line = this.createEdgeLine(edge, nodeMap, nodeSize);
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
    this.config.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.renderer.dispose();
    this.controls.dispose();
  }
}
