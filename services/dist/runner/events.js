"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEvents = exports.RunEventEmitter = void 0;
const events_1 = require("events");
class RunEventEmitter extends events_1.EventEmitter {
    emitStep(event) {
        this.emit('step', event);
        this.emit(`step:${event.runId}`, event);
    }
    emitDone(runId, summary) {
        this.emit('done', { runId, summary });
        this.emit(`done:${runId}`, { runId, summary });
    }
}
exports.RunEventEmitter = RunEventEmitter;
exports.runEvents = new RunEventEmitter();
