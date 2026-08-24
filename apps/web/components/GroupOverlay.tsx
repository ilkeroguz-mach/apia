'use client';

import React from 'react';

export interface GroupData {
  id: string;
  label: string;
  style?: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface GroupOverlayProps {
  groups: GroupData[];
}

export const GroupOverlay: React.FC<GroupOverlayProps> = ({ groups }) => {
  return (
    <>
      {groups.map(g => {
        if (!g.bounds) return null;
        const isAccent = g.id === 'customer-auth';
        return (
          <div
            key={g.id}
            style={{
              position: 'absolute',
              left: `${g.bounds.x}px`,
              top: `${g.bounds.y}px`,
              width: `${g.bounds.width}px`,
              height: `${g.bounds.height}px`,
              border: `1px dashed ${isAccent ? 'var(--color-accent-700)' : 'var(--color-neutral-600)'}`,
              borderRadius: 'var(--radius-lg)',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-9px',
                left: '16px',
                background: 'var(--color-bg)',
                padding: '0 8px',
                fontSize: '11px',
                color: isAccent ? 'var(--color-accent-300)' : 'var(--color-neutral-400)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {g.label}
            </div>
          </div>
        );
      })}
    </>
  );
};
