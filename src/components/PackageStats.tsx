"use client";

import type { PackageGraph } from "@/lib/types";
import { directDeps, heaviestPackages, rootNode, totalGzip, totalSize } from "@/lib/graph";
import { formatBytes } from "@/lib/format";

interface Props {
  graph: PackageGraph;
}

export function PackageStats({ graph }: Props) {
  const root = rootNode(graph);
  if (!root) return null;
  const direct = directDeps(graph).length;
  const total = graph.nodes.length;
  const sumSize = totalSize(graph);
  const sumGzip = totalGzip(graph);
  const heaviest = heaviestPackages(graph, 1)[0];

  return (
    <div className="rounded-xl border border-[#18181b] bg-[#0d0d10] p-5 flex flex-col gap-4">
      <div>
        <div className="text-[11.5px] uppercase tracking-wider text-[#71717a] mb-1">Package</div>
        <div className="font-semibold text-[16px] text-[#fafafa] truncate">{root.name}</div>
        <div className="text-[12.5px] text-[#a1a1aa]">v{root.version}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total bundle" value={formatBytes(sumSize)} accent />
        <Stat label="Total gzip" value={formatBytes(sumGzip)} />
        <Stat label="Direct deps" value={String(direct)} />
        <Stat label="Packages shown" value={String(total)} />
      </div>

      {heaviest && (
        <div className="pt-3 border-t border-[#18181b]">
          <div className="text-[11.5px] uppercase tracking-wider text-[#71717a] mb-1.5">
            Heaviest
          </div>
          <div className="text-[13.5px] text-[#fafafa] truncate">{heaviest.name}</div>
          <div className="text-[12px] text-[#71717a]">{formatBytes(heaviest.size)}</div>
        </div>
      )}

      {graph.truncated ? (
        <div className="text-[11.5px] text-[#71717a] leading-relaxed pt-2 border-t border-[#18181b]">
          Showing the first {total} packages. {graph.truncated}+ deps were trimmed for performance — click any node to drill in.
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-[#111113] border border-[#18181b] px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-wider text-[#71717a]">{label}</div>
      <div
        className={
          "text-[15px] font-semibold mt-0.5 " + (accent ? "text-[#a78bfa]" : "text-[#fafafa]")
        }
      >
        {value}
      </div>
    </div>
  );
}
