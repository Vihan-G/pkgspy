# pkgspy — CLAUDE.md

Inherit all rules from /Users/vihangoenka/claudeprojects/CLAUDE.md.

---

## What we're building

**pkgspy** — Type any npm package name. See its full dependency tree as an
interactive force graph. Every package it pulls in, its size, its own deps —
drill down infinitely. Understand exactly why your node_modules is 500MB.

No API key. No backend. Uses:
- `https://bundlephobia.com/api/size?package={name}` — bundle size data
- `https://registry.npmjs.org/{name}/latest` — dependency list

Target users: every JavaScript/TypeScript developer. That's the largest programming
community on earth. The question "why is this so big?" gets asked every single day.
Nothing visualizes it this beautifully.

---

## Tech stack

- Next.js 14, App Router, TypeScript, Tailwind, src/ layout
- `d3` — force-directed graph visualization (this IS the product)
- `framer-motion` — UI animations
- No backend. All data fetched client-side from public APIs.

```bash
npm install d3 @types/d3 framer-motion
```

---

## How it works

1. User types a package name (e.g. "lodash", "next", "axios", "moment")
2. App fetches from bundlephobia: gets size + dependency list
3. For each dependency, fetches its deps from npm registry (2 levels deep)
4. Builds a graph: nodes = packages, edges = "depends on"
5. D3 force simulation lays it out — nodes repel, edges pull
6. Node size = bundle size (bigger package = bigger circle)
7. Node color = size category (see below)
8. Click any node → fetch its deps, expand the graph live

---

## Data fetching (lib/npm.ts)

```typescript
interface PackageNode {
  id: string           // "lodash@4.17.21"
  name: string         // "lodash"
  version: string      // "4.17.21"
  size: number         // gzip size in bytes (from bundlephobia)
  gzip: number         // gzip size
  dependencies: string[] // direct dep names
  depth: number        // 0 = root, 1 = direct dep, 2 = transitive
  expanded: boolean    // whether we've fetched its children
}

interface PackageGraph {
  nodes: PackageNode[]
  links: { source: string; target: string }[]
}

// Fetch bundle size from bundlephobia
async function fetchSize(name: string, version?: string): Promise<{ size: number; gzip: number }>

// Fetch dependencies from npm registry
async function fetchDeps(name: string, version?: string): Promise<string[]>

// Build initial graph: root + depth-1 deps + depth-2 deps
// Cap at 60 nodes total for performance — if more, show "and X more" node
async function buildGraph(rootPackage: string): Promise<PackageGraph>
```

Fetching strategy:
- Root package: fetch size + deps immediately
- Depth 1 (direct deps): fetch all in parallel via Promise.allSettled
- Depth 2 (transitive): fetch top 10 by package popularity (just get dep list, not size — size fetch is slower)
- If bundlephobia returns 404 (package not found there), set size = 0 and show as unknown
- Cache all fetches in a Map so re-expanding nodes is instant

---

## D3 Force Graph (components/DependencyGraph.tsx)

This is the core component. Get it right.

```typescript
// SVG-based force simulation
// useEffect to initialize D3, useRef for the SVG element
// Re-run simulation when graph data changes

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(0.5))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 8))
```

### Node radius:
```typescript
function nodeRadius(node: PackageNode): number {
  if (node.size === 0) return 12
  if (node.size < 5000) return 14        // < 5KB
  if (node.size < 20000) return 18       // 5–20KB
  if (node.size < 100000) return 24      // 20–100KB
  if (node.size < 500000) return 32      // 100–500KB
  return 42                              // 500KB+
}
```

### Node colors:
```typescript
function nodeColor(node: PackageNode): string {
  if (node.depth === 0) return '#a78bfa'    // root — purple
  if (node.size === 0) return '#6b7280'     // unknown size — gray
  if (node.size < 5000) return '#22c55e'    // tiny — green
  if (node.size < 20000) return '#84cc16'   // small — lime
  if (node.size < 100000) return '#f59e0b'  // medium — amber
  if (node.size < 500000) return '#f97316'  // large — orange
  return '#ef4444'                          // huge — red
}
```

### Interactions:
- **Hover node**: show tooltip (package name, size, dep count)
- **Click node**: if not expanded, fetch its deps and add them to graph with animation
- **Drag nodes**: D3 drag behavior — nodes can be repositioned
- **Scroll/pinch**: D3 zoom — zoom in/out, pan
- **Double-click background**: reset zoom to fit

### Link styling:
- Stroke: `#ffffff12` (very subtle white)
- Stroke width: 1px
- No arrows — undirected visual

### Root node special treatment:
- Slightly larger than formula says
- Purple color `#a78bfa`
- Pulsing ring animation (CSS keyframe)
- Always stays near center

---

## File structure

```
src/
  app/
    page.tsx                      ← full page
    layout.tsx
    globals.css
  components/
    Header.tsx                    ← site header
    SearchBar.tsx                 ← package name input
    DependencyGraph.tsx           ← D3 force graph (main component)
    NodeTooltip.tsx               ← hover tooltip showing package details
    PackageStats.tsx              ← sidebar: total size, dep count, score
    SizeBreakdown.tsx             ← bar chart of biggest packages
    SizeLegend.tsx                ← color key: tiny/small/medium/large/huge
    LoadingGraph.tsx              ← skeleton graph while loading
    ExamplePackages.tsx           ← clickable examples
    Footer.tsx
  lib/
    npm.ts                        ← API fetching + graph building
    graph.ts                      ← graph data structure helpers
    format.ts                     ← formatBytes, formatCount helpers
    types.ts
```

---

## Page layout

### Header
```
[pkgspy logo]                          [GitHub → github.com/Vihan-G]
```
- Height: 56px, background `#09090b`, border-bottom `1px solid #18181b`
- Logo: spy/eye icon SVG + "pkgspy" in Inter bold white
- Tagline next to logo: "npm dependency visualizer" in small muted text

### Hero / Search
```
          Visualize any npm package's full dependency tree.
          Understand why your bundle is so large.

          [________ package name (e.g. "next", "lodash") ________] [Spy →]

          Popular: [next] [react] [lodash] [axios] [moment] [webpack]
```
- Centered, generous padding
- Background: `#09090b`
- Headline 40px bold white
- Subheadline 16px `#71717a`
- Popular chips: small clickable pills that auto-fill the input and trigger search
- These are important — makes the page interactive immediately on load

### Graph section (full width, dark)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [D3 graph — main area]                   │
│                       800px height                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     [Size legend: ● tiny ● small ● medium ● large ● huge]
```

### Stats sidebar (below graph or side panel on desktop)
```
Package: next@14.2.0
Total gzip size: 847 KB
Direct dependencies: 27
Total packages: 143
Heaviest: @next/swc-darwin-arm64 (380 KB)

[Top 5 heaviest packages — horizontal bar chart]
```

### Footer
```
pkgspy                    Made by Vihan Goenka · UCSD CS '29
                          github.com/Vihan-G
──────────────────────────────────────────────────────────────
        Data from bundlephobia.com and registry.npmjs.org
```

---

## UI design — dark, technical, beautiful

- Background everywhere: `#09090b` (zinc-950)
- Cards/panels: `#111113` with `1px solid #18181b` border
- Graph canvas background: `#09090b` — graph floats on dark
- Text primary: `#fafafa`
- Text secondary: `#71717a`
- Accent: `#a78bfa` (violet — matches root node color)
- Font: Inter for UI, no monospace needed
- No colored backgrounds on sections — everything dark
- Subtle radial gradient behind the graph: `radial-gradient(ellipse at center, #13111c 0%, #09090b 70%)` — gives depth
- Graph has a very subtle grid pattern in the background (CSS `background-image: radial-gradient(#ffffff06 1px, transparent 1px)`)

---

## Error states

- Package not found: "No package found for '{name}'. Check the spelling."
- Bundlephobia down: show graph with npm registry data only (no sizes, nodes all gray)
- Too many deps (>200): "This package has 200+ dependencies. Showing the largest 60."
- Private package: "This package is private or doesn't exist on npm."

---

## Performance rules

- Never fetch more than 60 nodes total
- Use Promise.allSettled for parallel fetches — never let one failure kill the whole graph
- Debounce the search input by 300ms
- Memoize node positions between re-renders so the graph doesn't re-layout on every state change
- If a fetch takes >3s, show a loading indicator on that specific node

---

## Setup commands

```bash
cd /Users/vihangoenka/claudeprojects

npx create-next-app@latest pkgspy --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint

cd pkgspy

npm install d3 @types/d3 framer-motion

git init
git add .
git commit -m "chore: initial scaffold"
gh repo create pkgspy --public --source=. --remote=origin --push
vercel --yes
touch .env.local
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: gitignore"
git push origin main
```

---

## Milestone commits (one session)

1. `chore: types, npm API client, graph builder`
2. `feat: header, search bar, popular package chips`
3. `feat: D3 force graph — nodes, links, simulation`
4. `feat: node hover tooltip and click-to-expand`
5. `feat: drag, zoom, pan interactions`
6. `feat: package stats sidebar and size breakdown`
7. `feat: size legend, loading state, error states`
8. `feat: footer, SEO metadata, responsive layout`
9. `docs: README, vercel prod, v1.0.0 release`

After commit 9:
```bash
vercel --prod
gh release create v1.0.0 --title "pkgspy v1.0.0" --notes "Visualize any npm package's full dependency tree as an interactive force graph. See exactly why your bundle is so large."
gh repo edit --add-topic npm --add-topic visualization --add-topic dependencies --add-topic d3 --add-topic nextjs --add-topic typescript --add-topic tools
```

---

## What done looks like

- Type "next" → force graph renders with 100+ nodes in <5 seconds
- Nodes sized by bundle weight, colored by size category
- Hover shows tooltip, click expands to show that package's deps
- Drag nodes around, zoom in/out, pan
- Stats panel shows total size, dep count, heaviest packages
- Popular chips on the hero let people try instantly without typing
- Works on mobile (touch drag, pinch zoom)
- Looks like a professional developer tool, not a tutorial
- Header, stats, legend, footer — full product structure
