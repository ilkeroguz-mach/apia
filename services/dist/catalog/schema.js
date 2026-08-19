"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowSchema = exports.StepSchema = exports.StepExpectSchema = exports.GraphSchema = exports.EdgeSchema = exports.NodeSchema = exports.GroupSchema = void 0;
const zod_1 = require("zod");
exports.GroupSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    style: zod_1.z.enum(['dashed', 'solid', 'dotted']).default('dashed'),
    bounds: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        width: zod_1.z.number(),
        height: zod_1.z.number()
    }).optional()
});
exports.NodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    path: zod_1.z.string(),
    type: zod_1.z.enum(['frontend', 'gateway', 'service', 'datastore', 'queue', 'external']).default('service'),
    service: zod_1.z.string().optional(),
    desc: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    baseUrl: zod_1.z.string().optional(),
    provides: zod_1.z.string().optional(),
    requires: zod_1.z.string().optional(),
    group: zod_1.z.string().optional(),
    pos: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
    body: zod_1.z.record(zod_1.z.any()).optional(),
    headers: zod_1.z.record(zod_1.z.string()).optional()
});
exports.EdgeSchema = zod_1.z.object({
    from: zod_1.z.string(),
    to: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    kind: zod_1.z.enum(['http', 'queue', 'db', 'rpc']).default('http')
});
exports.GraphSchema = zod_1.z.object({
    project: zod_1.z.string(),
    title: zod_1.z.string(),
    groups: zod_1.z.array(exports.GroupSchema).default([]),
    nodes: zod_1.z.array(exports.NodeSchema).default([]),
    edges: zod_1.z.array(exports.EdgeSchema).default([])
});
exports.StepExpectSchema = zod_1.z.object({
    status: zod_1.z.number().optional(),
    jsonpath: zod_1.z.string().optional(),
    exists: zod_1.z.boolean().optional(),
    equals: zod_1.z.any().optional()
});
exports.StepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    node: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    needs: zod_1.z.array(zod_1.z.string()).optional(),
    request: zod_1.z.object({
        method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        url: zod_1.z.string(),
        headers: zod_1.z.record(zod_1.z.string()).optional(),
        json: zod_1.z.any().optional()
    }),
    expect: zod_1.z.array(exports.StepExpectSchema).optional(),
    export: zod_1.z.record(zod_1.z.string()).optional()
});
exports.FlowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    entry: zod_1.z.string().optional(),
    touches: zod_1.z.array(zod_1.z.string()).default([]),
    vars: zod_1.z.record(zod_1.z.any()).default({}),
    steps: zod_1.z.array(exports.StepSchema)
});
