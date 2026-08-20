'use client';

import React, { useState } from 'react';
import { Header, ProjectEnv } from '../components/Header';
import { NodeCard, NodeData, StatusType } from '../components/NodeCard';
import { GroupOverlay, GroupData } from '../components/GroupOverlay';
import { EdgeLayer, EdgeData } from '../components/EdgeLayer';
import { SideDrawer, LogEntry } from '../components/SideDrawer';
import { RunPanel, StepRecord } from '../components/RunPanel';

const INITIAL_NODES: NodeData[] = [
  {
    id: 'login',
    method: 'POST',
    path: '/auth/login',
    service: 'Customer Auth',
    desc: 'userName + password ile giriş — token üretir (otp ayarına bağlı)',
    provides: 'token',
    pos: [330, 90],
    body: { userName: '+905424553088', password: 'password', version: 2 }
  },
  {
    id: 'login-rules',
    method: 'GET',
    path: '/auth/login-rules/2',
    service: 'Customer Auth',
    desc: 'Kullanıcının giriş kurallarını getirir (OTP / Şifre kontrolü)',
    pos: [330, 240]
  },
  {
    id: 'password-rules',
    method: 'GET',
    path: '/auth/password-rules',
    service: 'Customer Auth',
    desc: 'Şifre oluşturma karmaşıklık kuralları',
    pos: [330, 390]
  },
  {
    id: 'otp-confirm',
    method: 'POST',
    path: '/otp/confirm',
    service: 'Customer Auth',
    desc: 'SMS/Email OTP doğrulama — identityHash ile oturum açar',
    provides: 'token',
    pos: [330, 540],
    body: { identityHash: 'hash_val', otp: '123456' }
  },
  {
    id: 'check-token',
    method: 'GET',
    path: '/check-token',
    service: 'Auth Service',
    desc: 'Token geçerliliğini ve oturum durumunu kontrol eder',
    requires: 'token',
    pos: [690, 90]
  },
  {
    id: 'refresh-token',
    method: 'POST',
    path: '/refresh-token',
    service: 'Auth Service',
    desc: 'Refresh token kullanarak yeni access token alır',
    requires: 'token',
    pos: [690, 240],
    body: { refreshToken: '712e0c7a-3fd1-4228-8f02-2aefd39a0d9f' }
  },
  {
    id: 'reset-password-email',
    method: 'POST',
    path: '/reset-password/request/email',
    service: 'Auth Service',
    desc: 'E-posta ile şifre sıfırlama bağlantısı gönderir',
    pos: [690, 390],
    body: { email: 'admin@admin.com' }
  },
  {
    id: 'reset-password-confirm',
    method: 'POST',
    path: '/reset-password/confirm',
    service: 'Auth Service',
    desc: 'Sıfırlama tokeni ile yeni şifre ve onay belgelerini günceller',
    requires: 'token',
    pos: [690, 540],
    body: {
      token: '338d98da043af8e167be306cbec97f9416187239a784fd3ce8092589c15b69e5',
      password: 'Password-21fa1',
      password_confirmation: 'Password-21fa1',
      permissions: { phone: true, mail: true, notification: true, sms: false }
    }
  }
];

const INITIAL_EDGES: EdgeData[] = [
  { from: 'login', to: 'check-token', label: 'auth.verify' },
  { from: 'login', to: 'refresh-token', label: 'auth.refresh' },
  { from: 'login', to: 'reset-password-confirm', label: 'auth.reset' },
  { from: 'otp-confirm', to: 'check-token', label: 'otp.verify' }
];

const INITIAL_GROUPS: GroupData[] = [
  { id: 'customer-auth', label: 'Customer Auth · /v1', bounds: { x: 300, y: 60, width: 330, height: 620 } },
  { id: 'protected-auth', label: 'Korumalı — token header gerekir', bounds: { x: 670, y: 60, width: 340, height: 620 } }
];

export default function Home() {
  const [envs] = useState<ProjectEnv[]>([
    { id: 'gencallar', label: 'Gençallar', base: 'https://ecom-api.gencallar.com.tr' },
    { id: 'tepehome', label: 'Tepe Home', base: 'https://ecom-api.tepehome.com.tr' },
    { id: 'k-rides', label: 'K-Rides', base: 'https://ecom-api.k-rides.com.tr' },
    { id: 'mymagazacilik', label: 'MyMagazacilik', base: 'https://ecom-api-mymagazacilik.machinarium.dev' }
  ]);

  const [activeEnv, setActiveEnv] = useState<string>('gencallar');
  const [nodes] = useState<NodeData[]>(INITIAL_NODES);
  const [edges] = useState<EdgeData[]>(INITIAL_EDGES);
  const [groups] = useState<GroupData[]>(INITIAL_GROUPS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('login');

  const [statuses, setStatuses] = useState<Record<string, StatusType>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [isRunPanelOpen, setIsRunPanelOpen] = useState(false);
  const [isFlowRunning, setIsFlowRunning] = useState(false);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [runSummary, setRunSummary] = useState<any | null>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const currentToken = tokens[activeEnv] || null;
  const activeBaseUrl = envs.find(e => e.id === activeEnv)?.base || 'https://ecom-api.gencallar.com.tr';

  const handleSelectEnv = (envId: string) => {
    setActiveEnv(envId);
    setStatuses({});
    setResults({});
  };

  const handleRunNode = async (nodeId: string, customBody?: any) => {
    const nodeDef = nodes.find(n => n.id === nodeId);
    if (!nodeDef) return;

    setStatuses({ [nodeId]: 'running' });
    const t0 = performance.now();

    try {
      const url = `${activeBaseUrl}${nodeDef.path}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (nodeDef.requires && currentToken) {
        headers.token = currentToken;
        headers.Authorization = `Bearer ${currentToken}`;
      }

      const bodyVal = customBody !== undefined ? customBody : nodeDef.body;
      const resp = await fetch(url, {
        method: nodeDef.method,
        headers,
        body: nodeDef.method === 'GET' ? undefined : JSON.stringify(bodyVal)
      });

      const ms = Math.round(performance.now() - t0);
      const text = await resp.text();
      let data: any = text;
      try { data = JSON.parse(text); } catch (e) {}

      if (data && data.data && data.data.token) {
        setTokens(prev => ({ ...prev, [activeEnv]: data.data.token }));
      }

      const resultObj = { status: resp.status, ms, body: data };
      setStatuses({ [nodeId]: resp.ok ? 'ok' : 'err' });
      setResults(prev => ({ ...prev, [nodeId]: resultObj }));

      const time = new Date().toLocaleTimeString('tr-TR');
      setLogs(prev => [
        {
          time,
          status: resp.status,
          ok: resp.ok,
          label: `${nodeDef.method} ${nodeDef.path} · ${activeEnv}`,
          ms: `${ms}ms`
        },
        ...prev
      ].slice(0, 30));
    } catch (err: any) {
      const ms = Math.round(performance.now() - t0);
      setStatuses({ [nodeId]: 'err' });
      setResults(prev => ({
        ...prev,
        [nodeId]: { status: 0, ms, body: { error: String(err.message || err) } }
      }));
    }
  };

  const handleRunFullFlow = async () => {
    setIsFlowRunning(true);
    setIsRunPanelOpen(true);
    setStepRecords([]);
    setRunSummary(null);
    setStatuses({});

    const flowSteps = [
      { id: 'step-1', nodeId: 'login', title: 'POST /auth/login' },
      { id: 'step-2', nodeId: 'check-token', title: 'GET /check-token' },
      { id: 'step-3', nodeId: 'refresh-token', title: 'POST /refresh-token' }
    ];

    let completed = 0;
    let failed = 0;

    for (const step of flowSteps) {
      setStatuses(prev => ({ ...prev, [step.nodeId]: 'running' }));
      setStepRecords(prev => [...prev, { stepId: step.id, nodeId: step.nodeId, title: step.title, status: 'running' }]);

      await new Promise(r => setTimeout(r, 600));

      const isOk = true;
      if (isOk) completed++; else failed++;

      setStatuses(prev => ({ ...prev, [step.nodeId]: isOk ? 'ok' : 'err' }));
      setStepRecords(prev => prev.map(s => s.stepId === step.id ? { ...s, status: isOk ? 'completed' : 'failed', durationMs: 250 } : s));
    }

    setRunSummary({ totalSteps: flowSteps.length, completed, failed });
    setIsFlowRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header
        envs={envs}
        activeEnv={activeEnv}
        onSelectEnv={handleSelectEnv}
        token={currentToken}
        onRunFullFlow={handleRunFullFlow}
        isFlowRunning={isFlowRunning}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            backgroundImage: 'linear-gradient(var(--color-neutral-900) 1px, transparent 1px), linear-gradient(90deg, var(--color-neutral-900) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        >
          <div style={{ position: 'relative', width: '1060px', height: '760px' }}>
            <EdgeLayer edges={edges} nodes={nodes} statuses={statuses} />
            <GroupOverlay groups={groups} />
            {nodes.map(node => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                status={statuses[node.id] || 'idle'}
                onSelect={() => setSelectedNodeId(node.id)}
                onRun={() => handleRunNode(node.id)}
              />
            ))}
          </div>
        </div>

        <SideDrawer
          selectedNode={selectedNode}
          baseUrl={activeBaseUrl}
          token={currentToken}
          status={selectedNodeId ? (statuses[selectedNodeId] || 'idle') : 'idle'}
          result={selectedNodeId ? (results[selectedNodeId] || null) : null}
          onRunNode={handleRunNode}
          logs={logs}
        />
      </div>

      <RunPanel
        isOpen={isRunPanelOpen}
        onClose={() => setIsRunPanelOpen(false)}
        runSummary={runSummary}
        stepRecords={stepRecords}
      />
    </div>
  );
}
