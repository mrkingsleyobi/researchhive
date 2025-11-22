import { z } from 'zod';

// User types
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['admin', 'user', 'viewer']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// Research types
export const researchDepthSchema = z.enum(['quick', 'standard', 'deep']);
export type ResearchDepth = z.infer<typeof researchDepthSchema>;

export const researchStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
]);
export type ResearchStatus = z.infer<typeof researchStatusSchema>;

export const researchSchema = z.object({
  id: z.string(),
  topic: z.string(),
  description: z.string().optional(),
  depth: researchDepthSchema,
  status: researchStatusSchema,
  sources: z.array(z.string()),
  findings: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type Research = z.infer<typeof researchSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Agent types
export interface AgentTask {
  id: string;
  type: 'research' | 'analyze' | 'synthesize';
  input: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface SwarmConfig {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  protocol: 'quic' | 'tcp';
  maxAgents: number;
  memoryEnabled: boolean;
}
