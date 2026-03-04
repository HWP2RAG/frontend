"use client";

import { useMemo } from "react";
import type { BranchListItem, CommitHistoryItem } from "@/lib/collab-api";

// ─── Constants ────────────────────────────────────────────────────

const LANE_WIDTH = 30;
const ROW_HEIGHT = 50;
const NODE_RADIUS = 6;
const GRAPH_LEFT_PADDING = 20;
const TEXT_LEFT_MARGIN = 16;

const BRANCH_COLORS = [
  "#3b82f6", // blue (main)
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

// ─── Types ──────────────────────────────────────────────────────

export interface CommitNode extends CommitHistoryItem {
  branch: string;
  lane: number;
  y: number;
}

interface CommitGraphProps {
  commits: CommitHistoryItem[];
  branches: BranchListItem[];
  onCommitClick?: (sha: string) => void;
  selectedSha?: string | null;
}

// ─── Lane assignment ────────────────────────────────────────────

function assignLanes(
  commits: CommitHistoryItem[],
  branches: BranchListItem[]
): CommitNode[] {
  if (commits.length === 0) return [];

  // Build branch HEAD lookup: commitSha -> branch name
  const branchHeadMap = new Map<string, string>();
  for (const b of branches) {
    branchHeadMap.set(b.commitSha256, b.name);
  }

  // Assign lane numbers: main=0, others alphabetically
  const branchNames = branches.map((b) => b.name).sort((a, b) => {
    if (a === "main") return -1;
    if (b === "main") return 1;
    return a.localeCompare(b);
  });
  const laneMap = new Map<string, number>();
  branchNames.forEach((name, i) => laneMap.set(name, i));

  // Sort commits by time (newest first)
  const sorted = [...commits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Walk commits and assign branch membership
  // Strategy: track which branch each commit belongs to via HEAD reverse-walk
  const commitBranchMap = new Map<string, string>();

  // First pass: assign HEAD commits to their branch
  for (const b of branches) {
    commitBranchMap.set(b.commitSha256, b.name);
  }

  // Second pass: propagate branch assignment along parent chains
  // For each commit, if it's not assigned yet, inherit from the child that pointed to it
  const childMap = new Map<string, string[]>();
  for (const c of sorted) {
    if (c.parentSha256) {
      const children = childMap.get(c.parentSha256) ?? [];
      children.push(c.sha256);
      childMap.set(c.parentSha256, children);
    }
  }

  // Walk from newest to oldest, propagating branches
  for (const c of sorted) {
    if (!commitBranchMap.has(c.sha256)) {
      // Find a child that has a branch assigned
      const children = childMap.get(c.sha256);
      if (children) {
        for (const childSha of children) {
          const childBranch = commitBranchMap.get(childSha);
          if (childBranch) {
            commitBranchMap.set(c.sha256, childBranch);
            break;
          }
        }
      }
    }
    // If parent is unassigned, propagate our branch to it
    if (c.parentSha256 && !commitBranchMap.has(c.parentSha256)) {
      const myBranch = commitBranchMap.get(c.sha256);
      if (myBranch) {
        commitBranchMap.set(c.parentSha256, myBranch);
      }
    }
  }

  // Build CommitNodes
  return sorted.map((c, i) => {
    const branch = commitBranchMap.get(c.sha256) ?? branchNames[0] ?? "main";
    const lane = laneMap.get(branch) ?? 0;
    return {
      ...c,
      branch,
      lane,
      y: i,
    };
  });
}

// ─── Component ──────────────────────────────────────────────────

export function CommitGraph({
  commits,
  branches,
  onCommitClick,
  selectedSha,
}: CommitGraphProps) {
  const nodes = useMemo(
    () => assignLanes(commits, branches),
    [commits, branches]
  );

  const maxLane = useMemo(
    () => Math.max(0, ...nodes.map((n) => n.lane)),
    [nodes]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        커밋 히스토리가 없습니다
      </div>
    );
  }

  // Build sha -> node index for parent lookups
  const shaIndexMap = new Map<string, number>();
  nodes.forEach((n, i) => shaIndexMap.set(n.sha256, i));

  // Branch HEAD set for label rendering
  const branchHeadSet = new Map<string, string>();
  for (const b of branches) {
    branchHeadSet.set(b.commitSha256, b.name);
  }

  const graphWidth = (maxLane + 2) * LANE_WIDTH + GRAPH_LEFT_PADDING * 2;
  const svgHeight = nodes.length * ROW_HEIGHT + 40;

  function cx(lane: number): number {
    return GRAPH_LEFT_PADDING + lane * LANE_WIDTH + LANE_WIDTH / 2;
  }

  function cy(row: number): number {
    return 20 + row * ROW_HEIGHT + ROW_HEIGHT / 2;
  }

  function getColor(lane: number): string {
    return BRANCH_COLORS[lane % BRANCH_COLORS.length];
  }

  return (
    <div className="flex border rounded-lg overflow-hidden bg-background">
      {/* SVG Graph Column */}
      <div
        className="overflow-x-auto flex-shrink-0 border-r"
        style={{ width: graphWidth + "px" }}
      >
        <svg
          width={graphWidth}
          height={svgHeight}
          viewBox={`0 0 ${graphWidth} ${svgHeight}`}
        >
          {/* Connection lines */}
          {nodes.map((node) => {
            if (!node.parentSha256) return null;
            const parentIdx = shaIndexMap.get(node.parentSha256);
            if (parentIdx === undefined) return null;
            const parent = nodes[parentIdx];

            const x1 = cx(node.lane);
            const y1 = cy(node.y);
            const x2 = cx(parent.lane);
            const y2 = cy(parent.y);

            if (node.lane === parent.lane) {
              // Straight line for same lane
              return (
                <line
                  key={`line-${node.sha256}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={getColor(node.lane)}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                />
              );
            }

            // Bezier curve for cross-lane connections
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={`line-${node.sha256}`}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke={getColor(node.lane)}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            );
          })}

          {/* Branch labels */}
          {nodes.map((node) => {
            const branchName = branchHeadSet.get(node.sha256);
            if (!branchName) return null;

            const x = cx(node.lane);
            const y = cy(node.y) - NODE_RADIUS - 12;
            const color = getColor(node.lane);

            return (
              <g key={`label-${node.sha256}`}>
                <rect
                  x={x - 4}
                  y={y - 10}
                  width={branchName.length * 7 + 8}
                  height={16}
                  rx={3}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y}
                  fontSize={10}
                  fill={color}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {branchName}
                </text>
              </g>
            );
          })}

          {/* Commit nodes */}
          {nodes.map((node) => {
            const x = cx(node.lane);
            const y = cy(node.y);
            const color = getColor(node.lane);
            const isSelected = node.sha256 === selectedSha;

            return (
              <g
                key={`node-${node.sha256}`}
                className="cursor-pointer"
                onClick={() => onCommitClick?.(node.sha256)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? NODE_RADIUS + 2 : NODE_RADIUS}
                  fill={isSelected ? color : "var(--background)"}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Commit Info Column */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {nodes.map((node) => {
          const isSelected = node.sha256 === selectedSha;
          return (
            <div
              key={node.sha256}
              className={`flex items-center gap-3 px-3 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              }`}
              style={{ height: ROW_HEIGHT + "px" }}
              onClick={() => onCommitClick?.(node.sha256)}
            >
              <code className="text-xs text-muted-foreground font-mono flex-shrink-0">
                {node.sha256.slice(0, 8)}
              </code>
              <span className="text-sm truncate flex-1">
                {node.message.length > 40
                  ? node.message.slice(0, 40) + "..."
                  : node.message}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatRelativeTime(node.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;

  const months = Math.floor(days / 30);
  return `${months}개월 전`;
}
