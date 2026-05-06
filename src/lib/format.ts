export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1000000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

export function sizeCategory(size: number): "unknown" | "tiny" | "small" | "medium" | "large" | "huge" {
  if (!size || size <= 0) return "unknown";
  if (size < 5000) return "tiny";
  if (size < 20000) return "small";
  if (size < 100000) return "medium";
  if (size < 500000) return "large";
  return "huge";
}

export function categoryLabel(c: string): string {
  switch (c) {
    case "tiny": return "< 5 KB";
    case "small": return "5–20 KB";
    case "medium": return "20–100 KB";
    case "large": return "100–500 KB";
    case "huge": return "500 KB+";
    case "unknown": return "unknown";
    default: return c;
  }
}
