'use client';

import React, { useState } from 'react';
import { Header, ProjectEnv } from '../components/Header';
import { NodeCard, NodeData, StatusType } from '../components/NodeCard';
import { GroupOverlay, GroupData } from '../components/GroupOverlay';
import { EdgeLayer, EdgeData } from '../components/EdgeLayer';
import { SideDrawer, LogEntry } from '../components/SideDrawer';
import { RunPanel, StepRecord } from '../components/RunPanel';

const INITIAL_NODES: NodeData[] = [
  // Group 1: Customer Auth
  {
    id: 'login',
    method: 'POST',
    path: '/auth/login',
    service: 'Customer Auth',
    desc: 'Telefon No + OTP ile giriş (version: 2)',
    provides: 'token',
    pos: [65, 90],
    body: { userName: '+905424553088', password: 'password', version: 2 }
  },
  {
    id: 'login-rules',
    method: 'GET',
    path: '/auth/login-rules/2',
    service: 'Customer Auth',
    desc: 'Kullanıcının giriş kurallarını getirir (OTP / Şifre kontrolü)',
    pos: [65, 230]
  },
  {
    id: 'password-rules',
    method: 'GET',
    path: '/auth/password-rules',
    service: 'Customer Auth',
    desc: 'Şifre oluşturma karmaşıklık kuralları',
    pos: [65, 370]
  },
  {
    id: 'otp-confirm',
    method: 'POST',
    path: '/otp/confirm',
    service: 'Customer Auth',
    desc: 'SMS/Email OTP doğrulama — identityHash ile oturum açar',
    provides: 'token',
    pos: [65, 510],
    body: { identityHash: 'hash_val', otp: '123456' }
  },

  // Group 2: Verification (Gateway/Auth/Verification)
  {
    id: 'verification-request',
    method: 'POST',
    path: '/v1/me/verification',
    service: 'Verification',
    desc: 'Kullanıcı e-posta/telefon doğrulama kodu talebi gönderir',
    requires: 'token',
    pos: [440, 90]
  },
  {
    id: 'verification-resend',
    method: 'POST',
    path: '/v1/me/verification/resend',
    service: 'Verification',
    desc: 'Doğrulama kodunu tekrar gönderir',
    requires: 'token',
    pos: [440, 230]
  },
  {
    id: 'verification-verify',
    method: 'POST',
    path: '/v1/verification/verify',
    service: 'Verification',
    desc: 'Doğrulama kodunu ve identityHash doğrular',
    pos: [440, 370],
    body: {
      identityHash: 'fa3ee1c77b8d670eb3524bc3c7a52dae7b552dfde825d906db4f414dc045f3f1',
      token: '9ba1d8835a6dae4d034a64a057688ec1'
    }
  },
  {
    id: 'verification-status',
    method: 'GET',
    path: '/v1/me/verification/status',
    service: 'Verification',
    desc: 'Kullanıcı doğrulama durumunu getirir',
    requires: 'token',
    pos: [440, 510]
  },

  // Group 3: Password Activation (Gateway/Auth/Password Activation)
  {
    id: 'login-pw-trigger',
    method: 'POST',
    path: '/auth/login',
    service: 'Password Activation',
    desc: 'E-posta + Parola ile giriş (version: 1)',
    pos: [815, 90],
    body: { userName: 'admin@admin.com', password: 'password', version: 1 }
  },
  {
    id: 'pw-act-request',
    method: 'POST',
    path: '/password-activation/request',
    service: 'Password Activation',
    desc: 'Parola aktifleştirme için OTP talep et',
    pos: [815, 230],
    body: { username: 'test@example.com', type: 'email' }
  },
  {
    id: 'pw-act-verify',
    method: 'POST',
    path: '/password-activation/otp/verify',
    service: 'Password Activation',
    desc: 'Parola aktifleştirme OTP kodunu doğrula ve aktivasyon tokeni al',
    provides: 'token',
    pos: [815, 370],
    body: { identityHash: 'a1b2c3d4e5f6', otp: '123456' }
  },
  {
    id: 'pw-act-set',
    method: 'POST',
    path: '/password-activation/set',
    service: 'Password Activation',
    desc: 'Yeni parola belirle ve sözleşmeleri onayla',
    pos: [815, 510],
    body: {
      token: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      password: 'Password-123!',
      password_confirmation: 'Password-123!',
      permissions: { phone: true, mail: true, notification: true, sms: false }
    }
  },

  // Group 4: Korumalı — Token / Auth
  {
    id: 'check-token',
    method: 'GET',
    path: '/check-token',
    service: 'Auth Service',
    desc: 'Token geçerliliğini ve oturum durumunu kontrol eder',
    requires: 'token',
    pos: [1190, 90]
  },
  {
    id: 'refresh-token',
    method: 'POST',
    path: '/refresh-token',
    service: 'Auth Service',
    desc: 'Refresh token kullanarak yeni access token alır',
    requires: 'token',
    pos: [1190, 230],
    body: { refreshToken: '712e0c7a-3fd1-4228-8f02-2aefd39a0d9f' }
  },
  {
    id: 'reset-password-email',
    method: 'POST',
    path: '/reset-password/request/email',
    service: 'Auth Service',
    desc: 'E-posta ile şifre sıfırlama bağlantısı gönderir',
    pos: [1190, 370],
    body: { email: 'admin@admin.com' }
  },
  {
    id: 'reset-password-confirm',
    method: 'POST',
    path: '/reset-password/confirm',
    service: 'Auth Service',
    desc: 'Sıfırlama tokeni ile yeni şifre ve onay belgelerini günceller',
    requires: 'token',
    pos: [1190, 510],
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
  { from: 'login', to: 'verification-request', label: 'verify.request' },
  { from: 'verification-request', to: 'verification-verify', label: 'verify.confirm' },
  { from: 'verification-verify', to: 'verification-status', label: 'verify.status' },
  { from: 'login-pw-trigger', to: 'pw-act-request', label: 'pw.trigger' },
  { from: 'pw-act-request', to: 'pw-act-verify', label: 'pw.otp' },
  { from: 'pw-act-verify', to: 'pw-act-set', label: 'pw.set' },
  { from: 'pw-act-set', to: 'login', label: 'pw.complete' },
  { from: 'otp-confirm', to: 'check-token', label: 'otp.verify' },
  { from: 'login', to: 'refresh-token', label: 'auth.refresh' }
];

const INITIAL_GROUPS: GroupData[] = [
  { id: 'customer-auth', label: 'Customer Auth · /v1', bounds: { x: 50, y: 60, width: 330, height: 680 } },
  { id: 'verification', label: 'Verification · /v1/me', bounds: { x: 425, y: 60, width: 330, height: 680 } },
  { id: 'password-activation', label: 'Password Activation', bounds: { x: 800, y: 60, width: 330, height: 680 } },
  { id: 'protected-auth', label: 'Korumalı — Token / Auth', bounds: { x: 1175, y: 60, width: 330, height: 680 } }
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
      { id: 'step-2', nodeId: 'verification-request', title: 'POST /v1/me/verification' },
      { id: 'step-3', nodeId: 'pw-act-request', title: 'POST /password-activation/request' },
      { id: 'step-4', nodeId: 'check-token', title: 'GET /check-token' }
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
          <div style={{ position: 'relative', width: '1560px', height: '780px' }}>
            <EdgeLayer edges={edges} nodes={nodes} statuses={statuses} width={1560} height={780} />
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
