/**
 * WebSocket Service using Socket.io
 * Provides real-time updates for research progress
 */

import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';

export interface ProgressUpdate {
  researchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  agentsDeployed?: number;
  sourcesFound?: number;
  timestamp: string;
}

export interface ChatMessage {
  researchId: string;
  message: string;
  role: 'user' | 'agent' | 'system';
  timestamp: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Set<string> = new Set();

  constructor(fastify: FastifyInstance) {
    // Initialize Socket.io with Fastify server
    this.io = new SocketIOServer(fastify.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    console.log('🔌 WebSocket service initialized');
  }

  /**
   * Set up Socket.io event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.connectedClients.add(socket.id);
      console.log(`✅ Client connected: ${socket.id} (Total: ${this.connectedClients.size})`);

      // Handle client joining a research room
      socket.on('join-research', (researchId: string) => {
        socket.join(`research:${researchId}`);
        console.log(`📡 Client ${socket.id} joined research room: ${researchId}`);

        // Send acknowledgment
        socket.emit('joined-research', {
          researchId,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle client leaving a research room
      socket.on('leave-research', (researchId: string) => {
        socket.leave(`research:${researchId}`);
        console.log(`📴 Client ${socket.id} left research room: ${researchId}`);
      });

      // Handle user presence updates
      socket.on('user-active', (data: { researchId: string; userId: string }) => {
        socket.to(`research:${data.researchId}`).emit('user-presence', {
          userId: data.userId,
          status: 'active',
          timestamp: new Date().toISOString(),
        });
      });

      // Handle ping for connection health check
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.connectedClients.delete(socket.id);
        console.log(
          `❌ Client disconnected: ${socket.id} (Reason: ${reason}, Remaining: ${this.connectedClients.size})`
        );
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`⚠️  Socket error for client ${socket.id}:`, error);
      });
    });
  }

  /**
   * Emit research progress update to all subscribed clients
   */
  emitProgressUpdate(update: ProgressUpdate): void {
    const room = `research:${update.researchId}`;
    this.io.to(room).emit('progress-update', update);
    console.log(`📤 Progress update sent to ${room}: ${update.progress}%`);
  }

  /**
   * Emit multiple progress updates (batch)
   */
  emitProgressBatch(updates: ProgressUpdate[]): void {
    for (const update of updates) {
      this.emitProgressUpdate(update);
    }
  }

  /**
   * Emit chat message to research room
   */
  emitChatMessage(message: ChatMessage): void {
    const room = `research:${message.researchId}`;
    this.io.to(room).emit('chat-message', message);
    console.log(`💬 Chat message sent to ${room}`);
  }

  /**
   * Emit agent status update
   */
  emitAgentStatus(data: {
    researchId: string;
    agentId: string;
    status: 'starting' | 'running' | 'completed' | 'failed';
    message?: string;
  }): void {
    const room = `research:${data.researchId}`;
    this.io.to(room).emit('agent-status', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit source found event
   */
  emitSourceFound(data: {
    researchId: string;
    source: {
      title: string;
      url: string;
      relevance: number;
      credibility: number;
    };
  }): void {
    const room = `research:${data.researchId}`;
    this.io.to(room).emit('source-found', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit research completion event
   */
  emitResearchComplete(data: {
    researchId: string;
    summary: string;
    keyFindings: string[];
  }): void {
    const room = `research:${data.researchId}`;
    this.io.to(room).emit('research-complete', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Research completed notification sent to ${room}`);
  }

  /**
   * Emit error event
   */
  emitError(data: { researchId: string; error: string; code?: string }): void {
    const room = `research:${data.researchId}`;
    this.io.to(room).emit('research-error', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.error(`❌ Error notification sent to ${room}: ${data.error}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get number of clients in a specific research room
   */
  async getResearchRoomSize(researchId: string): Promise<number> {
    const room = `research:${researchId}`;
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.length;
  }

  /**
   * Close all connections gracefully
   */
  async close(): Promise<void> {
    console.log('🔌 Closing WebSocket connections...');
    await this.io.close();
    this.connectedClients.clear();
    console.log('✅ WebSocket service closed');
  }

  /**
   * Get Socket.io server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

/**
 * Initialize WebSocket service with Fastify instance
 */
export function initializeWebSocket(fastify: FastifyInstance): WebSocketService {
  if (!webSocketService) {
    webSocketService = new WebSocketService(fastify);
  }
  return webSocketService;
}

/**
 * Get WebSocket service instance
 */
export function getWebSocket(): WebSocketService {
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized. Call initializeWebSocket first.');
  }
  return webSocketService;
}
