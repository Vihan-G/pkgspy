import type { PackageGraph, PackageNode } from "./types";

export function totalSize(graph: PackageGraph): number {
  return graph.nodes.reduce((acc, n) => acc + (n.size || 0), 0);
}

export function totalGzip(graph: PackageGraph): number {
  return graph.nodes.reduce((acc, n) => acc + (n.gzip || 0), 0);
}

export function rootNode(graph: PackageGraph): PackageNode | undefined {
  return graph.nodes.find((n) => n.id === graph.rootId);
}

export function directDeps(graph: PackageGraph): PackageNode[] {
  return graph.nodes.filter((n) => n.depth === 1);
}

export function heaviestPackages(graph: PackageGraph, limit = 5): PackageNode[] {
  return graph.nodes
    .filter((n) => n.id !== graph.rootId && n.size > 0)
    .slice()
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}

export function nodeRadius(node: PackageNode): number {
  if (!node.size) return 12;
  if (node.size < 5000) return 14;
  if (node.size < 20000) return 18;
  if (node.size < 100000) return 24;
  if (node.size < 500000) return 32;
  return 42;
}

export function nodeColor(node: PackageNode): string {
  if (node.depth === 0) return "#a78bfa";
  if (!node.size) return "#6b7280";
  if (node.size < 5000) return "#22c55e";
  if (node.size < 20000) return "#84cc16";
  if (node.size < 100000) return "#f59e0b";
  if (node.size < 500000) return "#f97316";
  return "#ef4444";
}
