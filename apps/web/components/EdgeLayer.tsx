'use client';

import React from 'react';
import { NodeData, StatusType } from './NodeCard';

export interface EdgeData {
  from: string;
  to: string;
  label?: string;
  kind?: string;
}

interface EdgeLayerProps {
  edges: EdgeData[];
  nodes: NodeData[];
  statuses: Record<string, StatusType>;
  width?: number;
  height?: number;
}

export const EdgeLayer: React.FC<EdgeLayerProps> = ({
  edges,
  nodes,
  statuses,
  width = 1100,
  height = 760
}) => {
  const NODE_W = 300;
  const NODE_H = 96;

  const getEdgePath = (a: NodeData, b: NodeData) => {
    const [ax, ay] = a.pos || [300, 100];
    const [bx, by] = b.pos || [600, 100];
    const x1 = ax + NODE_W;
    const y1 = ay + NODE_H / 2;
    const x2 = bx;
    const y2 = by + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return {
      d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
      tx: x2,
      ty: y2
    };
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {edges.map((e, idx) => {
        const a = nodes.find(n => n.id === e.from);
        const b = nodes.find(n => n.id === e.to);
        if (!a || !b) return null;

        const { d, tx, ty } = getEdgePath(a, b);
        const bStatus = statuses[b.id] || 'idle';
        const aStatus = statuses[a.id] || 'idle';

        const isRunning = bStatus === 'running' || (aStatus === 'running' && bStatus === 'idle');

        let strokeColor = 'var(--color-neutral-700)';
        if (isRunning) {
          strokeColor = 'var(--color-accent)';
        } else if (bStatus === 'err') {
          strokeColor = '#ef4444';
        } else if (bStatus === 'ok') {
          strokeColor = 'var(--color-accent-600)';
        }

        return (
          <g key={`${e.from}-${e.to}-${idx}`}>
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeDasharray={isRunning ? '6 6' : 'none'}
              style={{
                animation: isRunning ? 'edgeflow 0.6s linear infinite' : 'none',
                transition: 'stroke 0.3s ease'
              }}
            />
            <circle cx={tx} cy={ty} r="3" fill={strokeColor} />
          </g>
        );
      })}
    </svg>
  );
};
