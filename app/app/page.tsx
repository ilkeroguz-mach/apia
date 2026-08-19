'use client';

import React, { useState, useEffect } from 'react';
import { Header, ProjectEnv } from '../components/Header';
import { NodeCard, NodeData, StatusType } from '../components/NodeCard';
import { GroupOverlay, GroupData } from '../components/GroupOverlay';
import { EdgeLayer, EdgeData } from '../components/EdgeLayer';
import { SideDrawer, LogEntry } from '../components/SideDrawer';
import { RunPanel, StepRecord } from '../components/RunPanel';

const API_BASE = 'http://localhost:7700';

export default function Home() {
  const [envs, setEnvs] = useState<ProjectEnv[]>([
    { id: 'gencallar', label: 'Gençallar', base: 'https://ecom-api.gencallar.com.tr' },
    { id: 'tepehome', label: 'Tepe Home', base: 'https://ecom-api.tepehome.com.tr' },
    { id: 'k-rides', label: 'K-Rides', base: 'https://ecom-api.k-rides.com.tr' },
    { id: 'mymagazacilik', label: 'MyMagazacilik', base: 'https://ecom-api-mymagazacilik.machinarium.dev' }
  ]);

  const [activeEnv, setActiveEnv] = useState<string>('gencallar');
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<Record<string, StatusType>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // DAG Run Panel state
  const [isRunPanelOpen, setIsRunPanelOpen] = useState(false);
  const [isFlowRunning, setIsFlowRunning] = useState(false);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [runSummary, setRunSummary] = useState<any | null>(null);

  // Fetch project graph on env change
  useEffect(() => {
    async function fetchGraph() {
      try {
        // Reset status and results when project changes
        setStatuses({});
        setResults({});
        setStepRecords([]);
        setRunSummary(null);

        const res = await fetch(`${API_BASE}/api/projects/${activeEnv}/graph`);
        if (!res.ok) return;
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setGroups(data.groups || []);

        if (data.nodes && data.nodes.length > 0) {
          setSelectedNodeId(data.nodes[0].id);
        }
      } catch (err) {
        console.error('Error fetching graph:', err);
      }
    }
    fetchGraph();
  }, [activeEnv]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const currentToken = tokens[activeEnv] || null;
  const activeBaseUrl = envs.find(e => e.id === activeEnv)?.base || 'https://ecom-api.gencallar.com.tr';

  const extractTokenFromResponse = (data: any): string | null => {
    if (!data || typeof data !== 'object') return null;
    if (data.token) return data.token;
    if (data.data && data.data.token) return data.data.token;
    if (data.data && data.data.accessToken) return data.data.accessToken;
    return null;
  };

  const handleRunNode = async (nodeId: string, customBody?: any) => {
    const nodeDef = nodes.find(n => n.id === nodeId);
    if (!nodeDef) return;

    // Reset status for a clean new run (only active node is running)
    setStatuses({ [nodeId]: 'running' });
    const t0 = performance.now();

    try {
      const res = await fetch(`${API_BASE}/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeEnv,
          nodeId,
          token: currentToken,
          customBody
        })
      });

      const { runId } = await res.json();

      // Listen to SSE stream for this run
      const eventSource = new EventSource(`${API_BASE}/api/runs/${runId}/stream`);

      eventSource.addEventListener('step', (evt: MessageEvent) => {
        const data = JSON.parse(evt.data);
        if (data.status === 'completed' || data.status === 'failed') {
          const ms = data.durationMs || Math.round(performance.now() - t0);
          const resultObj = data.result || { status: data.status === 'completed' ? 200 : 500, ms, body: { message: data.error } };
          
          setStatuses({ [nodeId]: data.status === 'completed' ? 'ok' : 'err' });
          setResults(prev => ({ ...prev, [nodeId]: resultObj }));

          // Extract token if login or otp node
          if (resultObj.body) {
            const extracted = extractTokenFromResponse(resultObj.body);
            if (extracted) {
              setTokens(prev => ({ ...prev, [activeEnv]: extracted }));
            }
          }

          // Add to log entry
          const time = new Date().toLocaleTimeString('tr-TR');
          setLogs(prev => [
            {
              time,
              status: resultObj.status || (data.status === 'completed' ? 200 : 500),
              ok: data.status === 'completed',
              label: `${nodeDef.method} ${nodeDef.path} · ${activeEnv}`,
              ms: `${ms}ms`
            },
            ...prev
          ].slice(0, 30));
        }
      });

      eventSource.addEventListener('done', () => {
        eventSource.close();
      });

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err: any) {
      const ms = Math.round(performance.now() - t0);
      setStatuses({ [nodeId]: 'err' });
      setResults(prev => ({
        ...prev,
        [nodeId]: { status: 0, ms, body: { error: String(err) } }
      }));
    }
  };

  const handleRunFullFlow = async () => {
    setIsFlowRunning(true);
    setIsRunPanelOpen(true);
    setStepRecords([]);
    setRunSummary(null);

    // Reset node execution statuses before full flow run
    setStatuses({});
    setResults({});

    try {
      const res = await fetch(`${API_BASE}/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeEnv,
          flowId: 'auth-flow',
          token: currentToken
        })
      });

      const { runId } = await res.json();
      const eventSource = new EventSource(`${API_BASE}/api/runs/${runId}/stream`);

      eventSource.addEventListener('step', (evt: MessageEvent) => {
        const stepData = JSON.parse(evt.data);
        setStepRecords(prev => {
          const idx = prev.findIndex(s => s.stepId === stepData.stepId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = stepData;
            return copy;
          }
          return [...prev, stepData];
        });

        if (stepData.nodeId) {
          setStatuses(prev => ({
            ...prev,
            [stepData.nodeId]: stepData.status === 'completed' ? 'ok' : stepData.status === 'failed' ? 'err' : 'running'
          }));
        }

        if (stepData.result && stepData.result.exports && stepData.result.exports.token) {
          setTokens(prev => ({ ...prev, [activeEnv]: stepData.result.exports.token }));
        }
      });

      eventSource.addEventListener('done', (evt: MessageEvent) => {
        const summary = JSON.parse(evt.data);
        setRunSummary(summary);
        setIsFlowRunning(false);
        eventSource.close();
      });

      eventSource.onerror = () => {
        setIsFlowRunning(false);
        eventSource.close();
      };
    } catch (err) {
      console.error('Error starting flow:', err);
      setIsFlowRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <Header
        envs={envs}
        activeEnv={activeEnv}
        onSelectEnv={setActiveEnv}
        token={currentToken}
        onRunFullFlow={handleRunFullFlow}
        isFlowRunning={isFlowRunning}
      />

      {/* Main Canvas + Side Drawer */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Canvas viewport */}
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
            {/* SVG Connections Layer */}
            <EdgeLayer edges={edges} nodes={nodes} statuses={statuses} />

            {/* Dashed Container Groups */}
            <GroupOverlay groups={groups} />

            {/* Interactive Node Cards */}
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

        {/* Right Side Drawer */}
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

      {/* Resizable Lower DAG Flow Run Panel */}
      <RunPanel
        isOpen={isRunPanelOpen}
        onClose={() => setIsRunPanelOpen(false)}
        runSummary={runSummary}
        stepRecords={stepRecords}
      />
    </div>
  );
}
