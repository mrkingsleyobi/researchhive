/**
 * React hook for real-time research progress updates via WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ResearchProgress {
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

export interface UseResearchProgressOptions {
  researchId: string;
  onProgress?: (progress: ResearchProgress) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onComplete?: (data: any) => void;
  onError?: (error: { error: string; code?: string }) => void;
  autoConnect?: boolean;
}

export function useResearchProgress(options: UseResearchProgressOptions) {
  const {
    researchId,
    onProgress,
    onChatMessage,
    onComplete,
    onError,
    autoConnect = true,
  } = options;

  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const socket = io(apiUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setError(null);

      // Join research room
      socket.emit('join-research', researchId);
    });

    socket.on('joined-research', (data: { researchId: string; timestamp: string }) => {
      console.log(`📡 Joined research room: ${data.researchId}`);
    });

    socket.on('progress-update', (data: ResearchProgress) => {
      console.log(`📊 Progress update: ${data.progress}%`);
      setProgress(data);
      onProgress?.(data);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      console.log('💬 Chat message received');
      setMessages((prev) => [...prev, message]);
      onChatMessage?.(message);
    });

    socket.on('research-complete', (data: any) => {
      console.log('✅ Research completed');
      onComplete?.(data);
    });

    socket.on('research-error', (errorData: { error: string; code?: string }) => {
      console.error('❌ Research error:', errorData.error);
      setError(errorData.error);
      onError?.(errorData);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🔌 WebSocket connection error:', err.message);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    return socket;
  }, [researchId, onProgress, onChatMessage, onComplete, onError]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-research', researchId);
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, [researchId]);

  // Send ping to check connection
  const ping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping');
    }
  }, []);

  // Set user as active
  const setUserActive = useCallback((userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user-active', { researchId, userId });
    }
  }, [researchId]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Periodic ping to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, ping]);

  return {
    progress,
    messages,
    isConnected,
    error,
    connect,
    disconnect,
    ping,
    setUserActive,
  };
}

/**
 * Hook for listening to all research updates (not scoped to a specific research)
 */
export function useGlobalResearchUpdates() {
  const [updates, setUpdates] = useState<ResearchProgress[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const socket = io(apiUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('progress-update', (data: ResearchProgress) => {
      setUpdates((prev) => [...prev.slice(-50), data]); // Keep last 50 updates
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    updates,
    isConnected,
  };
}
