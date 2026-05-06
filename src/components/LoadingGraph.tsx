"use client";

const NODES = [
  { x: 50, y: 50, r: 32, delay: 0 },
  { x: 22, y: 30, r: 14, delay: 0.15 },
  { x: 78, y: 28, r: 18, delay: 0.3 },
  { x: 16, y: 70, r: 18, delay: 0.45 },
  { x: 80, y: 75, r: 14, delay: 0.6 },
  { x: 50, y: 86, r: 16, delay: 0.75 },
  { x: 35, y: 18, r: 12, delay: 0.9 },
  { x: 64, y: 16, r: 12, delay: 1.05 },
];

interface Props {
  packageName?: string;
}

export function LoadingGraph({ packageName }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
      <div className="relative w-[260px] h-[200px]">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {NODES.slice(1).map((n, i) => (
            <line
              key={i}
              x1={NODES[0].x}
              y1={NODES[0].y}
              x2={n.x}
              y2={n.y}
              stroke="#ffffff"
              strokeOpacity={0.06}
              strokeWidth={0.4}
            />
          ))}
        </svg>
        {NODES.map((n, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: n.r,
              height: n.r,
              transform: "translate(-50%, -50%)",
              background:
                i === 0
                  ? "radial-gradient(circle, #a78bfa 0%, #6d28d9 80%)"
                  : "linear-gradient(180deg, #27272a, #18181b)",
              border: i === 0 ? "1px solid #ddd6fe" : "1px solid #27272a",
              animation: `pulse-loading 1.6s ease-in-out ${n.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="text-[13px] text-[#a1a1aa] flex items-center gap-2">
        <span className="inline-block w-3.5 h-3.5 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full spin-slow" />
        Resolving {packageName ?? "package"}…
      </div>
      <style>{`
        @keyframes pulse-loading {
          0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
