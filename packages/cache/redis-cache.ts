/**
 * Redis Caching Service
 * High-performance caching layer for API responses, AI results, and session data
 */

import { createClient, RedisClientType } from 'redis';
import { cacheHits, cacheMisses } from '@researchhive/monitoring';

export interface RedisCacheConfig {
  url?: string;
  password?: string;
  ttl?: number; // Default TTL in seconds
  keyPrefix?: string;
}

export class RedisCache {
  private client: RedisClientType | null = null;
  private defaultTTL: number;
  private keyPrefix: string;
  private connected: boolean = false;

  constructor(config: RedisCacheConfig = {}) {
    this.defaultTTL = config.ttl || 3600; // 1 hour default
    this.keyPrefix = config.keyPrefix || 'researchhive:';
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    const password = process.env.REDIS_PASSWORD;

    this.client = createClient({
      url,
      password,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.connected = true;
    });

    this.client.on('disconnect', () => {
      console.log('⚠️  Redis disconnected');
      this.connected = false;
    });

    await this.client.connect();
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      const value = await this.client.get(fullKey);

      if (value === null) {
        cacheMisses.inc({ cache_type: 'redis' });
        return null;
      }

      cacheHits.inc({ cache_type: 'redis' });
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      cacheMisses.inc({ cache_type: 'redis' });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;
    const expirySeconds = ttl || this.defaultTTL;

    try {
      await this.client.setEx(fullKey, expirySeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      await this.client.del(fullKey);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullPattern = this.keyPrefix + pattern;

    try {
      const keys = await this.client.keys(fullPattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
      return 0;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      return await this.client.incrBy(fullKey, by);
    } catch (error) {
      console.error('Redis INCR error:', error);
      throw error;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      const result = await this.client.expire(fullKey, seconds);
      return result;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  async ttl(key: string): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const fullKey = this.keyPrefix + key;

    try {
      return await this.client.ttl(fullKey);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -2; // Key doesn't exist
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      await this.client.flushAll();
      console.log('⚠️  Redis: All keys flushed');
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  }> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    try {
      const info = await this.client.info('stats');
      const keys = await this.client.dbSize();

      // Parse info string
      const stats: any = {};
      info.split('\r\n').forEach((line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });

      return {
        keys,
        memory: stats.used_memory_human || '0B',
        hits: parseInt(stats.keyspace_hits || '0'),
        misses: parseInt(stats.keyspace_misses || '0'),
      };
    } catch (error) {
      console.error('Redis STATS error:', error);
      return { keys: 0, memory: '0B', hits: 0, misses: 0 };
    }
  }

  /**
   * Ping Redis server
   */
  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connected = false;
      console.log('✅ Redis disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
let cacheInstance: RedisCache | null = null;

/**
 * Get or create Redis cache instance
 */
export async function getCache(config?: RedisCacheConfig): Promise<RedisCache> {
  if (!cacheInstance) {
    cacheInstance = new RedisCache(config);
    await cacheInstance.connect();
  }
  return cacheInstance;
}

/**
 * Cache decorator for async functions
 */
export function Cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = await getCache();
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      return await cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl
      );
    };

    return descriptor;
  };
}
