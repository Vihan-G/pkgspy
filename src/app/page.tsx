"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { ExamplePackages } from "@/components/ExamplePackages";
import { DependencyGraph } from "@/components/DependencyGraph";
import { buildGraph } from "@/lib/npm";
import type { PackageGraph } from "@/lib/types";

export default function Home() {
  const [pkg, setPkg] = useState<string>("");
  const [graph, setGraph] = useState<PackageGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    buildGraph(pkg, { signal: ctrl.signal })
      .then((g) => setGraph(g))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to build graph";
        setError(msg);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [pkg]);

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
        <div className="mx-auto max-w-7xl">
          <div
            ref={containerRef}
            className="relative rounded-xl border border-[#18181b] graph-bg h-[480px] sm:h-[640px] overflow-hidden"
          >
            {graph && !loading && !error && (
              <DependencyGraph graph={graph} width={size.width} height={size.height} />
            )}
            {loading && (
              <div className="absolute inset-0 grid place-items-center text-[#71717a] text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full spin-slow" />
                  fetching {pkg}…
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="absolute inset-0 grid place-items-center text-[#fca5a5] text-sm">
                {error}
              </div>
            )}
            {!loading && !graph && !error && (
              <div className="absolute inset-0 grid place-items-center text-[#52525b] text-sm">
                Type a package or pick a popular one to see its dependency graph.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
