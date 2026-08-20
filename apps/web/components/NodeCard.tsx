'use client';

import React from 'react';
import { Play } from 'lucide-react';

export interface NodeData {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  desc?: string;
  service?: string;
  provides?: string;
  requires?: string;
  pos?: [number, number];
  body?: any;
}

export type StatusType = 'idle' | 'running' | 'ok' | 'err';

interface NodeCardProps {
  node: NodeData;
  isSelected: boolean;
  status: StatusType;
  onSelect: () => void;
  onRun: () => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  status,
  onSelect,
  onRun
}) => {
  const [x, y] = node.pos || [300, 100];

  const getBorderColor = () => {
    if (status === 'running') return 'var(--color-accent)';
    if (status === 'ok') return 'var(--color-accent-500)';
    if (status === 'err') return '#ef4444';
    if (isSelected) return 'var(--color-accent-600)';
    return 'var(--color-neutral-700)';
  };

  const getDotColor = () => {
    if (status === 'ok') return 'var(--color-accent-300)';
    if (status === 'err') return '#ef4444';
    if (status === 'running') return 'var(--color-accent)';
    return 'var(--color-neutral-600)';
  };

  const isGet = node.method === 'GET';

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '300px',
        boxSizing: 'border-box',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${getBorderColor()}`,
        background: 'color-mix(in oklab, var(--color-neutral-900) 90%, transparent)',
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        boxShadow: isSelected || status === 'running' ? '0 4px 14px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '.04em',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            background: isGet ? 'var(--color-accent-800)' : 'var(--color-neutral-800)',
            color: isGet ? 'var(--color-accent-200)' : 'var(--color-neutral-200)',
            border: `1px solid ${isGet ? 'var(--color-accent-700)' : 'var(--color-neutral-700)'}`
          }}
        >
          {node.method}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
          {node.path}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getDotColor(),
            animation: status === 'running' ? 'pulse 1s infinite' : 'none',
            flex: 'none'
          }}
        />
      </div>

      {node.desc && (
        <div style={{ fontSize: '11.5px', color: 'var(--color-neutral-400)', marginTop: '6px', lineHeight: 1.4 }}>
          {node.desc}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
        <button
          className="btn btn-primary"
          onClick={(ev) => {
            ev.stopPropagation();
            onRun();
          }}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          <Play style={{ width: 12, height: 12, marginRight: 5 }} />
          Çalıştır
        </button>
        {node.service && (
          <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
            {node.service}
          </span>
        )}
      </div>
    </div>
  );
};
