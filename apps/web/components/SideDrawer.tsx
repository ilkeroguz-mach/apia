'use client';

import React, { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { NodeData, StatusType } from './NodeCard';

export interface LogEntry {
  time: string;
  status: number | string;
  ok: boolean;
  label: string;
  ms: string;
}

interface SideDrawerProps {
  selectedNode: NodeData | null;
  baseUrl: string;
  token: string | null;
  status: StatusType;
  result: any | null;
  onRunNode: (nodeId: string, customBody?: any) => void;
  logs: LogEntry[];
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  selectedNode,
  baseUrl,
  token,
  status,
  result,
  onRunNode,
  logs
}) => {
  const [copied, setCopied] = useState(false);
  const [editedBody, setEditedBody] = useState<string>('');
  const [bodyInitializedNodeId, setBodyInitializedNodeId] = useState<string | null>(null);

  if (!selectedNode) {
    return (
      <div
        style={{
          width: '420px',
          flex: 'none',
          borderLeft: '1px solid var(--color-neutral-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-neutral-900)',
          color: 'var(--color-neutral-500)',
          fontSize: '13px'
        }}
      >
        Detaylarını görmek ve çalıştırmak için bir kutuya tıkla
      </div>
    );
  }

  if (bodyInitializedNodeId !== selectedNode.id) {
    setEditedBody(selectedNode.body ? JSON.stringify(selectedNode.body, null, 2) : '');
    setBodyInitializedNodeId(selectedNode.id);
  }

  const isGet = selectedNode.method === 'GET';
  const url = `${baseUrl}${selectedNode.path}`;

  const headersList = [
    'Content-Type: application/json',
    ...(selectedNode.requires ? [token ? `token: ${token.slice(0, 28)}…` : 'token: (yok — login gerekli)'] : [])
  ];

  const handleCopyCurl = () => {
    let curl = `curl -X ${selectedNode.method} '${url}'`;
    if (selectedNode.requires && token) {
      curl += ` -H 'Authorization: Bearer ${token}' -H 'token: ${token}'`;
    }
    curl += ` -H 'Content-Type: application/json'`;
    if (!isGet && editedBody) {
      curl += ` -d '${editedBody.replace(/\n\s*/g, ' ')}'`;
    }

    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRun = () => {
    let customBody: any = undefined;
    if (!isGet && editedBody) {
      try {
        customBody = JSON.parse(editedBody);
      } catch (e) {
        customBody = editedBody;
      }
    }
    onRunNode(selectedNode.id, customBody);
  };

  const isSuccess = result && result.status >= 200 && result.status < 400;

  return (
    <div
      style={{
        width: '420px',
        flex: 'none',
        borderLeft: '1px solid var(--color-neutral-800)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: 'var(--color-neutral-900)'
      }}
    >
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--color-neutral-800)' }}>
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
            {selectedNode.method}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
            {selectedNode.path}
          </span>
          <span style={{ flex: 1 }} />
          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSuccess ? 'var(--color-accent-800)' : 'rgba(239, 68, 68, 0.2)',
                  color: isSuccess ? 'var(--color-accent-200)' : '#fca5a5'
                }}
              >
                {result.status || 'ERR'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-neutral-400)', fontFamily: 'var(--font-mono)' }}>
                {result.ms}ms
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-neutral-400)',
            marginTop: '6px',
            wordBreak: 'break-all'
          }}
        >
          {url}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '6px' }}>
            Headers
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: '11.5px',
              lineHeight: 1.5,
              color: 'var(--color-neutral-200)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {headersList.join('\n')}
          </pre>
        </div>

        {!isGet && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '6px' }}>
              Request body — düzenlenebilir
            </div>
            <textarea
              className="input"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              spellCheck={false}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                minHeight: '110px',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleRun} disabled={status === 'running'} style={{ fontSize: '12.5px', padding: '6px 14px' }}>
            <Play style={{ width: 13, height: 13, marginRight: 6 }} />
            {status === 'running' ? 'Çalıştırılıyor…' : 'Çalıştır'}
          </button>
          <button className="btn btn-secondary" onClick={handleCopyCurl} style={{ fontSize: '12.5px', padding: '6px 14px' }}>
            {copied ? <Check style={{ width: 13, height: 13, marginRight: 6, color: '#34d399' }} /> : <Copy style={{ width: 13, height: 13, marginRight: 6 }} />}
            {copied ? 'Kopyalandı ✓' : 'cURL kopyala'}
          </button>
        </div>

        <div>
          <div style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '6px' }}>
            Response
          </div>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-neutral-800)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11.5px',
              lineHeight: 1.55,
              color: 'var(--color-accent-200)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              minHeight: '100px',
              maxHeight: '260px',
              overflow: 'auto'
            }}
          >
            {result ? JSON.stringify(result.body || result, null, 2) : (status === 'running' ? 'İstek gönderiliyor…' : '— henüz çalıştırılmadı —')}
          </pre>
        </div>
      </div>

      <div style={{ flex: 'none', borderTop: '1px solid var(--color-neutral-800)', padding: '10px 18px', maxHeight: '150px', overflow: 'auto' }}>
        <div style={{ fontSize: '11px', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: '6px' }}>
          Çalışma geçmişi
        </div>
        {logs.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--color-neutral-500)', fontFamily: 'var(--font-mono)' }}>
            Henüz çalışma kaydı yok
          </div>
        ) : (
          logs.map((l, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '2px 0' }}>
              <span style={{ color: 'var(--color-neutral-500)' }}>{l.time}</span>
              <span style={{ color: l.ok ? 'var(--color-accent-300)' : '#ef4444', fontWeight: 600 }}>{l.status}</span>
              <span style={{ color: 'var(--color-neutral-300)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.label}</span>
              <span style={{ color: 'var(--color-neutral-500)' }}>{l.ms}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
