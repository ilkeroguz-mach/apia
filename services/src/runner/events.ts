import { EventEmitter } from 'events';

export interface StepEvent {
  runId: string;
  stepId: string;
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  durationMs?: number;
}

export class RunEventEmitter extends EventEmitter {
  emitStep(event: StepEvent) {
    this.emit('step', event);
    this.emit(`step:${event.runId}`, event);
  }

  emitDone(runId: string, summary: any) {
    this.emit('done', { runId, summary });
    this.emit(`done:${runId}`, { runId, summary });
  }
}

export const runEvents = new RunEventEmitter();
