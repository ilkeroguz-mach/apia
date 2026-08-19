import { z } from 'zod';

export const GroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  style: z.enum(['dashed', 'solid', 'dotted']).default('dashed'),
  bounds: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional()
});

export const NodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string(),
  type: z.enum(['frontend', 'gateway', 'service', 'datastore', 'queue', 'external']).default('service'),
  service: z.string().optional(),
  desc: z.string().optional(),
  repo: z.string().optional(),
  baseUrl: z.string().optional(),
  provides: z.string().optional(),
  requires: z.string().optional(),
  group: z.string().optional(),
  pos: z.tuple([z.number(), z.number()]).optional(),
  body: z.record(z.any()).optional(),
  headers: z.record(z.string()).optional()
});

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  kind: z.enum(['http', 'queue', 'db', 'rpc']).default('http')
});

export const GraphSchema = z.object({
  project: z.string(),
  title: z.string(),
  groups: z.array(GroupSchema).default([]),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([])
});

export const StepExpectSchema = z.object({
  status: z.number().optional(),
  jsonpath: z.string().optional(),
  exists: z.boolean().optional(),
  equals: z.any().optional()
});

export const StepSchema = z.object({
  id: z.string(),
  node: z.string(),
  title: z.string().optional(),
  needs: z.array(z.string()).optional(),
  request: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    url: z.string(),
    headers: z.record(z.string()).optional(),
    json: z.any().optional()
  }),
  expect: z.array(StepExpectSchema).optional(),
  export: z.record(z.string()).optional()
});

export const FlowSchema = z.object({
  id: z.string(),
  title: z.string(),
  entry: z.string().optional(),
  touches: z.array(z.string()).default([]),
  vars: z.record(z.any()).default({}),
  steps: z.array(StepSchema)
});

export type Graph = z.infer<typeof GraphSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type Step = z.infer<typeof StepSchema>;
