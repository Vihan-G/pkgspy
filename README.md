# pkgspy

**Visualize any npm package's full dependency tree as an interactive force graph.**

Type a package name. See every transitive dep it pulls in, sized by bundle weight,
colored by size category. Drill down infinitely to understand exactly why your
`node_modules` is so large.

> Live: https://pkgspy.vercel.app

![pkgspy screenshot](./public/screenshot.png)

## What it does

- Fetches package metadata from [bundlephobia](https://bundlephobia.com) (size, gzip)
  and the [npm registry](https://registry.npmjs.org) (dependency lists)
- Builds a graph of the root package + direct deps + transitive deps (capped at 60 nodes)
- Lays it out with a [D3 force simulation](https://d3js.org/d3-force) — nodes repel,
  edges pull
- Click any node → fetches *its* deps and expands the graph live
- Hover → tooltip with package name, version, bundle size, gzip size, dep count
- Drag, zoom, and pan — double-click background to reset

No backend. No API keys. Everything runs in the browser against public APIs.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) · TypeScript · Tailwind v4
- [d3](https://d3js.org) — force-directed graph + drag + zoom
- [framer-motion](https://www.framer.com/motion/) — UI animations
- Deployed on [Vercel](https://vercel.com)

## Run locally

```bash
git clone https://github.com/Vihan-G/pkgspy.git
cd pkgspy
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
  app/                page, layout, global styles
  components/
    Header.tsx
    SearchBar.tsx
    ExamplePackages.tsx
    DependencyGraph.tsx   ← D3 force graph (the main thing)
    NodeTooltip.tsx
    PackageStats.tsx
    SizeBreakdown.tsx
    SizeLegend.tsx
    LoadingGraph.tsx
    Footer.tsx
  lib/
    npm.ts          ← bundlephobia + npm registry fetch + graph builder
    graph.ts        ← graph helpers (radius, color, totals, heaviest)
    format.ts       ← formatBytes, sizeCategory
    types.ts
```

## Color legend

| Color | Range |
|---|---|
| violet | root package |
| green | < 5 KB (tiny) |
| lime | 5–20 KB (small) |
| amber | 20–100 KB (medium) |
| orange | 100–500 KB (large) |
| red | 500 KB+ (huge) |
| gray | size unknown |

## License

MIT — built by [Vihan Goenka](https://github.com/Vihan-G), UCSD CS '29.
