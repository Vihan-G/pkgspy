"use client";

import type { PackageNode } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { sizeCategory, categoryLabel } from "@/lib/format";

interface Props {
  node: PackageNode | null;
  x: number;
  y: number;
  containerWidth: number;
}

export function NodeTooltip({ node, x, y, containerWidth }: Props) {
  if (!node) return null;
  const flipX = x > containerWidth - 240;
  const cat = node.depth === 0 ? "root" : sizeCategory(node.size);

  return (
    <div
      className="absolute pointer-events-none z-20 transition-opacity"
      style={{
        left: flipX ? x - 12 : x + 12,
        top: y + 12,
        transform: flipX ? "translateX(-100%)" : undefined,
      }}
    >
      <div className="rounded-lg border border-[#27272a] bg-[#0e0e10]/95 backdrop-blur px-3 py-2.5 shadow-xl min-w-[180px] max-w-[260px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            aria-hidden
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: dotColor(node) }}
          />
          <span className="font-semibold text-[13.5px] text-[#fafafa] truncate">
            {node.name}
          </span>
        </div>
        <div className="text-[11.5px] text-[#71717a] mb-2">v{node.version}</div>
        <Row label="Bundle size" value={node.unknown || !node.size ? "unknown" : formatBytes(node.size)} />
        <Row label="Gzipped" value={node.unknown || !node.gzip ? "—" : formatBytes(node.gzip)} />
        <Row label="Direct deps" value={String(node.dependencies.length)} />
        <Row label="Category" value={cat === "root" ? "root package" : categoryLabel(cat)} />
        {!node.expanded && node.dependencies.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#27272a] text-[11.5px] text-[#a78bfa]">
            click to expand →
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-[12px] py-0.5">
      <span className="text-[#71717a]">{label}</span>
      <span className="text-[#e4e4e7] font-medium">{value}</span>
    </div>
  );
}

function dotColor(node: PackageNode): string {
  if (node.depth === 0) return "#a78bfa";
  if (!node.size) return "#6b7280";
  if (node.size < 5000) return "#22c55e";
  if (node.size < 20000) return "#84cc16";
  if (node.size < 100000) return "#f59e0b";
  if (node.size < 500000) return "#f97316";
  return "#ef4444";
}
