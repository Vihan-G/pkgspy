"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ExamplePackages } from "@/components/ExamplePackages";
import { DependencyGraph } from "@/components/DependencyGraph";
import { NodeTooltip } from "@/components/NodeTooltip";
import { PackageStats } from "@/components/PackageStats";
import { SizeBreakdown } from "@/components/SizeBreakdown";
import { SizeLegend } from "@/components/SizeLegend";
import { LoadingGraph } from "@/components/LoadingGraph";
import { Footer } from "@/components/Footer";
import { buildGraph, expandNode } from "@/lib/npm";
import type { PackageGraph, PackageNode } from "@/lib/types";

export default function Home() {
  const [pkg, setPkg] = useState<string>("");
  const [graph, setGraph] = useState<PackageGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{ node: PackageNode | null; x: number; y: number }>({
    node: null,
    x: 0,
    y: 0,
  });
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 1024, height: 640 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(320, rect.width), height: Math.max(320, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!pkg) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setGraph(null);
    setHover({ node: null, x: 0, y: 0 });
    buildGraph(pkg, { signal: ctrl.signal })
      .then((g) => setGraph(g))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to build graph";
        setError(msg);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [pkg]);

  const handleClickNode = useCallback(
    async (node: PackageNode) => {
      if (!graph) return;
      if (node.expanded || node.dependencies.length === 0) return;
      setExpandingId(node.id);
      try {
        const next = await expandNode(graph, node);
        setGraph(next);
      } catch {
        // ignore — leave node un-expanded
      } finally {
        setExpandingId(null);
      }
    },
    [graph]
  );

  const handleHover = useCallback(
    (node: PackageNode | null, x: number, y: number) => {
      setHover({ node, x, y });
    },
    []
  );

  return (
    <main className="min-h-dvh flex flex-col">
      <Header />

      <section className="px-4 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-5">
          <h1 className="text-[28px] sm:text-[40px] leading-[1.1] font-semibold tracking-tight text-[#fafafa]">
            Visualize any npm package&rsquo;s
            <br className="hidden sm:block" /> full dependency tree.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#71717a] max-w-xl">
            Type a package, see every dep it pulls in, sized by bundle weight.
            Understand exactly why your <code className="text-[#a78bfa]">node_modules</code> is so large.
          </p>

          <div className="w-full flex justify-center mt-1">
            <SearchBar initialValue={pkg} onSubmit={setPkg} loading={loading} />
          </div>

          <ExamplePackages onPick={setPkg} active={pkg} />
        </div>
      </section>

      <section className="flex-1 px-4 sm:px-6 pb-12">
        <div className="mx-auto max-w-7xl grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
          <div
            ref={containerRef}
            className="relative rounded-xl border border-[#18181b] graph-bg h-[480px] sm:h-[640px] overflow-hidden"
          >
            {graph && !loading && !error && (
              <>
                <DependencyGraph
                  graph={graph}
                  width={size.width}
                  height={size.height}
                  expandingId={expandingId}
                  onHover={handleHover}
                  onClickNode={handleClickNode}
                />
                <NodeTooltip
                  node={hover.node}
                  x={hover.x}
                  y={hover.y}
                  containerWidth={size.width}
                />
              </>
            )}
            {loading && <LoadingGraph packageName={pkg} />}
            {!loading && error && (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div className="max-w-md flex flex-col items-center gap-2">
                  <span
                    aria-hidden
                    className="grid place-items-center w-10 h-10 rounded-full bg-[#1f1416] border border-[#3f1f24] text-[#fca5a5]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v5" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div className="text-[14px] text-[#fafafa] font-medium">Couldn&rsquo;t resolve that package</div>
                  <div className="text-[12.5px] text-[#a1a1aa]">{error}</div>
                </div>
              </div>
            )}
            {!loading && !graph && !error && (
              <div className="absolute inset-0 grid place-items-center text-[#52525b] text-sm px-6 text-center">
                Type a package or pick a popular one to see its dependency graph.
              </div>
            )}
          </div>
            <div className="px-1">
              <SizeLegend />
            </div>
            <p className="text-[11.5px] text-[#52525b] px-1 hidden sm:block">
              Tip: drag nodes · scroll to zoom · double-click empty space to reset · click a node to expand its deps
            </p>
          </div>

          <aside className="flex flex-col gap-4">
            {graph && !loading && !error ? (
              <>
                <PackageStats graph={graph} />
                <SizeBreakdown graph={graph} />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[#27272a] p-5 text-[12.5px] text-[#52525b]">
                Stats &amp; size breakdown will appear here once a package is loaded.
              </div>
            )}
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
