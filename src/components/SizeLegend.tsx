const ITEMS = [
  { label: "root", color: "#a78bfa", range: "" },
  { label: "tiny", color: "#22c55e", range: "< 5 KB" },
  { label: "small", color: "#84cc16", range: "5–20 KB" },
  { label: "medium", color: "#f59e0b", range: "20–100 KB" },
  { label: "large", color: "#f97316", range: "100–500 KB" },
  { label: "huge", color: "#ef4444", range: "500 KB+" },
  { label: "unknown", color: "#6b7280", range: "no data" },
];

export function SizeLegend() {
  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11.5px] text-[#a1a1aa]">
      {ITEMS.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          <span className="text-[#e4e4e7]">{it.label}</span>
          {it.range && <span className="text-[#52525b]">{it.range}</span>}
        </div>
      ))}
    </div>
  );
}
