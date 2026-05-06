"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import type { PackageGraph, PackageNode, PackageLink } from "@/lib/types";
import { nodeColor, nodeRadius } from "@/lib/graph";

type SimNode = d3.SimulationNodeDatum & PackageNode;
type SimLink = d3.SimulationLinkDatum<SimNode> & { source: string | SimNode; target: string | SimNode };

interface Props {
  graph: PackageGraph;
  width: number;
  height: number;
}

export function DependencyGraph({ graph, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const positionsRef = useRef<Map<string, { x: number; y: number; vx?: number; vy?: number }>>(new Map());
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  const { simNodes, simLinks } = useMemo(() => {
    const positions = positionsRef.current;
    const simNodes: SimNode[] = graph.nodes.map((n) => {
      const cached = positions.get(n.id);
      return {
        ...n,
        x: cached?.x ?? width / 2 + (Math.random() - 0.5) * 80,
        y: cached?.y ?? height / 2 + (Math.random() - 0.5) * 80,
        vx: cached?.vx ?? 0,
        vy: cached?.vy ?? 0,
        fx: n.depth === 0 ? width / 2 : undefined,
        fy: n.depth === 0 ? height / 2 : undefined,
      };
    });
    const simLinks: SimLink[] = graph.links.map((l: PackageLink) => ({
      source: l.source,
      target: l.target,
    }));
    return { simNodes, simLinks };
  }, [graph, width, height]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("class", "viewport");

    const linkSel = g
      .append("g")
      .attr("class", "links")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.07)
      .attr("stroke-width", 1)
      .selectAll<SVGLineElement, SimLink>("line")
      .data(simLinks)
      .join("line");

    const nodeSel = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, SimNode>("g.node")
      .data(simNodes, (d) => d.id)
      .join("g")
      .attr("class", "node");

    nodeSel
      .filter((d) => d.depth === 0)
      .append("circle")
      .attr("class", "pulse-ring")
      .attr("r", (d) => nodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.55);

    nodeSel
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", (d) => (d.depth === 0 ? nodeRadius(d) + 4 : nodeRadius(d)))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", (d) => (d.depth === 0 ? "#ddd6fe" : "#09090b"))
      .attr("stroke-width", (d) => (d.depth === 0 ? 2 : 1.5))
      .attr("opacity", (d) => (d.unknown ? 0.55 : 1));

    nodeSel
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.depth === 0 ? nodeRadius(d) + 22 : nodeRadius(d) + 14))
      .attr("font-size", (d) => (d.depth === 0 ? 13 : 11))
      .attr("font-weight", (d) => (d.depth === 0 ? 600 : 400))
      .attr("fill", (d) => (d.depth === 0 ? "#fafafa" : "#a1a1aa"))
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .text((d) => (d.name.length > 20 ? d.name.slice(0, 18) + "…" : d.name));

    const sim = d3
      .forceSimulation<SimNode, SimLink>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(80)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 8)
      )
      .alpha(0.9)
      .alphaDecay(0.035);

    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    simRef.current = sim;

    return () => {
      sim.stop();
      simNodes.forEach((n) => {
        if (n.x != null && n.y != null) {
          positionsRef.current.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy });
        }
      });
    };
  }, [simNodes, simLinks, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full h-full select-none"
    />
  );
}
