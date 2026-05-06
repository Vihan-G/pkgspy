"use client";

import type { PackageGraph } from "@/lib/types";
import { heaviestPackages } from "@/lib/graph";
import { formatBytes } from "@/lib/format";

interface Props {
  graph: PackageGraph;
  limit?: number;
}

export function SizeBreakdown({ graph, limit = 5 }: Props) {
  const top = heaviestPackages(graph, limit);
  if (top.length === 0) return null;
  const max = top[0].size;

  return (
    <div className="rounded-xl border border-[#18181b] bg-[#0d0d10] p-5">
      <div className="text-[11.5px] uppercase tracking-wider text-[#71717a] mb-3">
        Heaviest packages
      </div>
      <div className="flex flex-col gap-2.5">
        {top.map((n) => {
          const pct = max > 0 ? Math.max(6, Math.round((n.size / max) * 100)) : 0;
          return (
            <div key={n.id} className="text-[12.5px]">
              <div className="flex justify-between mb-1 gap-2">
                <span className="text-[#e4e4e7] truncate">{n.name}</span>
                <span className="text-[#a1a1aa] tabular-nums shrink-0">
                  {formatBytes(n.size)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#18181b] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background:
                      "linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
