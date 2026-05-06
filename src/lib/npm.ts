import type { BuildOptions, PackageGraph, PackageNode, SizeInfo } from "./types";

const sizeCache = new Map<string, SizeInfo | null>();
const depsCache = new Map<string, { version: string; deps: string[] } | null>();

const BUNDLEPHOBIA = "https://bundlephobia.com/api/size";
const REGISTRY = "https://registry.npmjs.org";

function fetchWithTimeout(url: string, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function fetchSize(name: string, signal?: AbortSignal): Promise<SizeInfo | null> {
  const key = name;
  if (sizeCache.has(key)) return sizeCache.get(key) ?? null;
  try {
    const res = await fetchWithTimeout(
      `${BUNDLEPHOBIA}?package=${encodeURIComponent(name)}`,
      8000,
      signal
    );
    if (!res.ok) {
      sizeCache.set(key, null);
      return null;
    }
    const json = (await res.json()) as { size?: number; gzip?: number };
    const info: SizeInfo = { size: json.size ?? 0, gzip: json.gzip ?? 0 };
    sizeCache.set(key, info);
    return info;
  } catch {
    sizeCache.set(key, null);
    return null;
  }
}

export async function fetchDeps(
  name: string,
  signal?: AbortSignal
): Promise<{ version: string; deps: string[] } | null> {
  const key = name;
  if (depsCache.has(key)) return depsCache.get(key) ?? null;
  try {
    const res = await fetchWithTimeout(
      `${REGISTRY}/${encodeURIComponent(name).replace("%40", "@")}/latest`,
      8000,
      signal
    );
    if (!res.ok) {
      depsCache.set(key, null);
      return null;
    }
    const json = (await res.json()) as {
      version?: string;
      dependencies?: Record<string, string>;
    };
    const result = {
      version: json.version ?? "latest",
      deps: Object.keys(json.dependencies ?? {}),
    };
    depsCache.set(key, result);
    return result;
  } catch {
    depsCache.set(key, null);
    return null;
  }
}

function makeNode(
  name: string,
  version: string,
  size: number,
  gzip: number,
  dependencies: string[],
  depth: number,
  expanded: boolean,
  unknown = false
): PackageNode {
  return {
    id: `${name}@${version}`,
    name,
    version,
    size,
    gzip,
    dependencies,
    depth,
    expanded,
    unknown,
  };
}

export async function buildGraph(
  rootName: string,
  opts: BuildOptions = {}
): Promise<PackageGraph> {
  const { maxNodes = 60, signal, onProgress } = opts;
  const cleanName = rootName.trim();
  if (!cleanName) throw new Error("Empty package name");

  const [rootDeps, rootSize] = await Promise.all([
    fetchDeps(cleanName, signal),
    fetchSize(cleanName, signal),
  ]);

  if (!rootDeps && !rootSize) {
    throw new Error(`No package found for "${cleanName}".`);
  }

  const rootVersion = rootDeps?.version ?? "latest";
  const rootSizeBytes = rootSize?.size ?? 0;
  const rootGzip = rootSize?.gzip ?? 0;
  const rootDeplist = rootDeps?.deps ?? [];

  const rootNode = makeNode(
    cleanName,
    rootVersion,
    rootSizeBytes,
    rootGzip,
    rootDeplist,
    0,
    true,
    !rootSize
  );

  const nodes: PackageNode[] = [rootNode];
  const nodeByName = new Map<string, PackageNode>();
  nodeByName.set(cleanName, rootNode);
  const links: { source: string; target: string }[] = [];

  let truncated = 0;
  const depth1Names = rootDeplist.slice(0, Math.max(0, maxNodes - 1));
  if (rootDeplist.length > depth1Names.length) {
    truncated += rootDeplist.length - depth1Names.length;
  }

  const depth1Results = await Promise.allSettled(
    depth1Names.map(async (name) => {
      const [deps, size] = await Promise.all([fetchDeps(name, signal), fetchSize(name, signal)]);
      return { name, deps, size };
    })
  );

  for (const r of depth1Results) {
    if (r.status !== "fulfilled") continue;
    const { name, deps, size } = r.value;
    if (nodeByName.has(name)) continue;
    if (nodes.length >= maxNodes) {
      truncated += 1;
      continue;
    }
    const node = makeNode(
      name,
      deps?.version ?? "latest",
      size?.size ?? 0,
      size?.gzip ?? 0,
      deps?.deps ?? [],
      1,
      false,
      !size
    );
    nodes.push(node);
    nodeByName.set(name, node);
    links.push({ source: rootNode.id, target: node.id });
  }

  if (onProgress) onProgress({ nodes: [...nodes], links: [...links], rootId: rootNode.id });

  const depth1Nodes = nodes.filter((n) => n.depth === 1);
  const candidates = depth1Nodes
    .slice()
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  for (const parent of candidates) {
    if (nodes.length >= maxNodes) break;
    const childNames = parent.dependencies.slice(0, 6);
    const childResults = await Promise.allSettled(
      childNames.map(async (name) => {
        const deps = await fetchDeps(name, signal);
        return { name, deps };
      })
    );
    for (const r of childResults) {
      if (r.status !== "fulfilled") continue;
      const { name, deps } = r.value;
      if (nodes.length >= maxNodes) {
        truncated += 1;
        break;
      }
      let node = nodeByName.get(name);
      if (!node) {
        node = makeNode(
          name,
          deps?.version ?? "latest",
          0,
          0,
          deps?.deps ?? [],
          2,
          false,
          true
        );
        nodes.push(node);
        nodeByName.set(name, node);
        // Kick off size fetch in the background — don't block graph render
        fetchSize(name, signal).then((s) => {
          if (s && node) {
            node.size = s.size;
            node.gzip = s.gzip;
            node.unknown = false;
          }
        });
      }
      const linkExists = links.some(
        (l) => l.source === parent.id && l.target === node!.id
      );
      if (!linkExists) links.push({ source: parent.id, target: node.id });
    }
    parent.expanded = true;
  }

  return { nodes, links, rootId: rootNode.id, truncated: truncated || undefined };
}

export async function expandNode(
  graph: PackageGraph,
  node: PackageNode,
  signal?: AbortSignal,
  maxNodes = 100
): Promise<PackageGraph> {
  if (node.expanded) return graph;
  const nameToId = new Map<string, string>();
  for (const n of graph.nodes) nameToId.set(n.name, n.id);

  const deps = node.dependencies;
  const newNodes: PackageNode[] = [];
  const newLinks: { source: string; target: string }[] = [];

  const results = await Promise.allSettled(
    deps.slice(0, 12).map(async (name) => {
      const [d, s] = await Promise.all([fetchDeps(name, signal), fetchSize(name, signal)]);
      return { name, d, s };
    })
  );

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { name, d, s } = r.value;
    let target: PackageNode | undefined;
    const existingId = nameToId.get(name);
    if (existingId) {
      target = graph.nodes.find((n) => n.id === existingId);
    } else {
      if (graph.nodes.length + newNodes.length >= maxNodes) continue;
      target = {
        id: `${name}@${d?.version ?? "latest"}`,
        name,
        version: d?.version ?? "latest",
        size: s?.size ?? 0,
        gzip: s?.gzip ?? 0,
        dependencies: d?.deps ?? [],
        depth: node.depth + 1,
        expanded: false,
        unknown: !s,
      };
      newNodes.push(target);
      nameToId.set(name, target.id);
    }
    if (!target) continue;
    const linkExists =
      graph.links.some((l) => l.source === node.id && l.target === target!.id) ||
      newLinks.some((l) => l.source === node.id && l.target === target!.id);
    if (!linkExists) newLinks.push({ source: node.id, target: target.id });
  }

  return {
    ...graph,
    nodes: [...graph.nodes, ...newNodes].map((n) =>
      n.id === node.id ? { ...n, expanded: true } : n
    ),
    links: [...graph.links, ...newLinks],
  };
}
