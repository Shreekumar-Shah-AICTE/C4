import type { ReactElement } from 'react';

import { crowdLevelFor } from '@/core/crowd';
import { segmentKey } from '@/core/graph';
import type { CrowdLevel, StadiumEdge, StadiumNode } from '@/core/types';
import type { EdgeHeat } from '@/lib/api';

const CROWD_COLOR: Record<CrowdLevel, string> = {
  calm: 'var(--calm)',
  moderate: 'var(--moderate)',
  busy: 'var(--busy)',
  congested: 'var(--congested)',
};

interface StadiumMapProps {
  readonly nodes: readonly StadiumNode[];
  readonly edges: readonly StadiumEdge[];
  readonly heat: readonly EdgeHeat[];
  readonly routeNodeIds: readonly string[];
  readonly originId: string;
  readonly destinationId: string;
  readonly animate: boolean;
}

function indexNodes(nodes: readonly StadiumNode[]): Map<string, StadiumNode> {
  const map = new Map<string, StadiumNode>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
}

function indexHeat(heat: readonly EdgeHeat[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of heat) {
    map.set(segmentKey(entry.from, entry.to), entry.density);
  }
  return map;
}

function routePath(routeNodeIds: readonly string[], nodesById: Map<string, StadiumNode>): string {
  const points: string[] = [];
  for (const id of routeNodeIds) {
    const node = nodesById.get(id);
    if (node !== undefined) {
      points.push(`${points.length === 0 ? 'M' : 'L'} ${node.x} ${node.y}`);
    }
  }
  return points.join(' ');
}

function nodeRadius(kind: StadiumNode['kind']): number {
  if (kind === 'gate' || kind === 'exit') {
    return 2.4;
  }
  if (kind === 'seat' || kind === 'facility') {
    return 1.9;
  }
  return 1.4;
}

function nodeFill(node: StadiumNode, originId: string, destinationId: string): string {
  if (node.id === originId) {
    return 'var(--calm)';
  }
  if (node.id === destinationId) {
    return 'var(--accent)';
  }
  return '#8fb7a1';
}

/** SVG stadium map: faint crowd-coloured concourse with the route highlighted. */
export function StadiumMap({
  nodes,
  edges,
  heat,
  routeNodeIds,
  originId,
  destinationId,
  animate,
}: StadiumMapProps): ReactElement {
  const nodesById = indexNodes(nodes);
  const heatBySegment = indexHeat(heat);
  const path = routePath(routeNodeIds, nodesById);
  const label = `Stadium map showing the route from ${originId} to ${destinationId}.`;

  return (
    <svg
      className="stadium-map"
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{label}</title>
      {edges.map((edge: StadiumEdge) => {
        const from = nodesById.get(edge.from);
        const to = nodesById.get(edge.to);
        if (from === undefined || to === undefined) {
          return null;
        }
        const density = heatBySegment.get(segmentKey(edge.from, edge.to)) ?? 0;
        const level = crowdLevelFor(density);
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={CROWD_COLOR[level]}
            strokeWidth={level === 'congested' || level === 'busy' ? 1.1 : 0.7}
            strokeOpacity={0.55}
            strokeDasharray={level === 'congested' ? '1.6 1.2' : undefined}
          />
        );
      })}
      {path.length > 0 ? (
        <path className={animate ? 'route-line animated' : 'route-line'} d={path} />
      ) : null}
      {nodes.map((node: StadiumNode) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={nodeRadius(node.kind)}
          fill={nodeFill(node, originId, destinationId)}
          stroke="#03110a"
          strokeWidth={0.3}
        />
      ))}
    </svg>
  );
}
