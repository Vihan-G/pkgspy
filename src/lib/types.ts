export interface PackageNode {
  id: string;
  name: string;
  version: string;
  size: number;
  gzip: number;
  dependencies: string[];
  depth: number;
  expanded: boolean;
  unknown?: boolean;
}

export interface PackageLink {
  source: string;
  target: string;
}

export interface PackageGraph {
  nodes: PackageNode[];
  links: PackageLink[];
  rootId: string;
  truncated?: number;
}

export interface SizeInfo {
  size: number;
  gzip: number;
}

export type SizeCategory = "unknown" | "tiny" | "small" | "medium" | "large" | "huge" | "root";

export interface BuildOptions {
  maxNodes?: number;
  signal?: AbortSignal;
  onProgress?: (graph: PackageGraph) => void;
}
