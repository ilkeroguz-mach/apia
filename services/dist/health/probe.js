"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.probeHostPort = probeHostPort;
const net_1 = __importDefault(require("net"));
async function probeHostPort(host, port, timeoutMs = 1000) {
    return new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        let status = false;
        socket.setTimeout(timeoutMs);
        socket.on('connect', () => {
            status = true;
            socket.destroy();
        });
        socket.on('timeout', () => {
            socket.destroy();
        });
        socket.on('error', () => {
            socket.destroy();
        });
        socket.on('close', () => {
            resolve(status);
        });
        socket.connect(port, host);
    });
}
