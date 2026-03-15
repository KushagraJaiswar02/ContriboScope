import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: redisUrl,
});

client.on('error', (err) => console.error('❌ [Redis] Client Error:', err));

// Self-invoking async to connect
(async () => {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('🚀 [Redis] Connected to local instance');
    } catch (err) {
      console.error('❌ [Redis] Connection failed:', err);
    }
  }
})();

export const cache = {
  /**
   * Get a cached value by key. Returns null if not found.
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      if (!client.isOpen) return null;
      console.log(`🚀 [Redis] Getting key: "${key}"`);
      const data = await client.get(key);
      return data ? JSON.parse(data) as T : null;
    } catch (err) {
      console.error(`❌ [Redis] Get error:`, err);
      return null;
    }
  },

  /**
   * Set a value in the cache with an optional TTL (defaults to 24h).
   */
  set: async (key: string, value: any, ttlSeconds: number = 86400): Promise<void> => {
    try {
      if (!client.isOpen) return;
      console.log(`🚀 [Redis] Setting key: "${key}" with TTL: ${ttlSeconds}s`);
      const stringified = JSON.stringify(value);
      await client.set(key, stringified, {
        EX: ttlSeconds
      });
    } catch (err) {
      console.error(`❌ [Redis] Set error:`, err);
    }
  },

  /**
   * Delete a key from the cache.
   */
  delete: async (key: string): Promise<void> => {
    try {
      if (!client.isOpen) return;
      await client.del(key);
    } catch (err) {
      console.error(`❌ [Redis] Delete error:`, err);
    }
  }
};

export default client;
