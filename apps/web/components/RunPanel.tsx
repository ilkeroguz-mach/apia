'use client';

import React from 'react';
import { CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

export interface StepRecord {
  stepId: string;
  nodeId: string;
  title: string;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  request?: any;
  response?: any;
  durationMs?: number;
  error?: string;
}

interface RunPanelProps {
  isOpen: boolean;
  onClose: () => void;
  runSummary: any | null;
  stepRecords: StepRecord[];
}

export const RunPanel: React.FC<RunPanelProps> = ({
  isOpen,
  onClose,
  runSummary,
  stepRecords
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        height: '240px',
        borderTop: '1px solid var(--color-neutral-800)',
        background: 'var(--color-neutral-950)',
        display: 'flex',
        flexDirection: 'column',
        flex: 'none'
      }}
    >
      <div
        style={{
          padding: '8px 18px',
          borderBottom: '1px solid var(--color-neutral-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-neutral-900)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-neutral-200)' }}>
            Akış Çalıştırma Sonuçları
          </span>
          {runSummary && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-neutral-400)' }}>
              Tamamlanan: {runSummary.completed}/{runSummary.totalSteps} (Hata: {runSummary.failed})
            </span>
          )}
        </div>
        <button
          className="btn btn-secondary"
          onClick={onClose}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          Kapat
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 18px' }}>
        {stepRecords.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
            Akış başlatılıyor…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stepRecords.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isFailed = step.status === 'failed';
              const isRunning = step.status === 'running';

              return (
                <div
                  key={step.stepId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-neutral-900)',
                    border: '1px solid var(--color-neutral-800)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px'
                  }}
                >
                  {isCompleted && <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-accent-300)', flex: 'none' }} />}
                  {isFailed && <XCircle style={{ width: 16, height: 16, color: '#ef4444', flex: 'none' }} />}
                  {isRunning && <Clock style={{ width: 16, height: 16, color: 'var(--color-accent)', animation: 'pulse 1s infinite', flex: 'none' }} />}
                  {!isCompleted && !isFailed && !isRunning && (
                    <ChevronRight style={{ width: 16, height: 16, color: 'var(--color-neutral-600)', flex: 'none' }} />
                  )}

                  <span style={{ fontWeight: 600, color: 'var(--color-neutral-200)' }}>
                    {step.title}
                  </span>

                  <span style={{ color: 'var(--color-neutral-400)', fontSize: '11px' }}>
                    Node: {step.nodeId}
                  </span>

                  <div style={{ flex: 1 }} />

                  {step.durationMs !== undefined && (
                    <span style={{ color: 'var(--color-neutral-500)', fontSize: '11px' }}>
                      {step.durationMs}ms
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCompleted ? 'var(--color-accent-800)' : isFailed ? 'rgba(239, 68, 68, 0.2)' : 'var(--color-neutral-800)',
                      color: isCompleted ? 'var(--color-accent-200)' : isFailed ? '#fca5a5' : 'var(--color-neutral-400)'
                    }}
                  >
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
