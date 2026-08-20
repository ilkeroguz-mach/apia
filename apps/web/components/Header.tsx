'use client';

import React from 'react';
import { GitBranch, Key, Play } from 'lucide-react';

export interface ProjectEnv {
  id: string;
  label: string;
  base: string;
}

interface HeaderProps {
  envs: ProjectEnv[];
  activeEnv: string;
  onSelectEnv: (id: string) => void;
  token: string | null;
  onRunFullFlow: () => void;
  isFlowRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  envs,
  activeEnv,
  onSelectEnv,
  token,
  onRunFullFlow,
  isFlowRunning
}) => {
  const tokenShort = token ? `${token.slice(0, 18)}…` : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 20px',
        borderBottom: '1px solid var(--color-neutral-800)',
        flex: 'none',
        background: 'var(--color-bg)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <GitBranch style={{ color: 'var(--color-accent)', width: 20, height: 20 }} />
        <div style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '.01em' }}>
          Visual API Tester
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-neutral-400)', marginLeft: '4px' }}>
          akışa tıkla · çalıştır
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={onRunFullFlow}
        disabled={isFlowRunning}
        style={{
          fontSize: '12px',
          padding: '4px 12px',
          marginLeft: '12px',
          opacity: isFlowRunning ? 0.7 : 1
        }}
      >
        <Play style={{ width: 13, height: 13, marginRight: 5 }} />
        {isFlowRunning ? 'Akış Koşuyor…' : 'Tüm Akışı Çalıştır'}
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {token ? (
          <span className="tag tag-accent" style={{ fontSize: '11px' }}>
            <Key style={{ width: 12, height: 12, marginRight: 4 }} />
            {tokenShort}
          </span>
        ) : (
          <span className="tag tag-outline" style={{ fontSize: '11px', color: 'var(--color-neutral-400)' }}>
            token yok
          </span>
        )}

        <div style={{ display: 'flex', background: 'var(--color-neutral-900)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-neutral-800)' }}>
          {envs.map(e => {
            const isActive = activeEnv === e.id;
            return (
              <button
                key={e.id}
                onClick={() => onSelectEnv(e.id)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--color-accent-800)' : 'transparent',
                  color: isActive ? 'var(--color-accent-100)' : 'var(--color-neutral-400)',
                  transition: 'all 0.15s ease'
                }}
              >
                {e.id}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
