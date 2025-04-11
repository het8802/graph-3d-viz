export type GraphType = 'directed' | 'undirected' | 'tree' | 'DAG' | 'cyclic' | 'acyclic';

export interface Node {
  id: string;
  label?: string;
  color?: string;
  position?: [number, number, number];
}

export interface Edge {
  from: string;
  to: string;
  weight?: number;
  color?: string;
}

export interface GraphData {
  type: GraphType;
  nodes: Node[];
  edges: Edge[];
}

export interface GraphConfig {
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
