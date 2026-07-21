// Optional production upgrade for the AI response cache.
// The in-memory Map in ragService.js works fine for a single-instance
// deployment (fine for a college project / demo), but loses its cache on
// restart and can't be shared across multiple server instances.
//
// To use this instead:
//   1. npm install redis
//   2. Add REDIS_URL to .env (e.g. redis://localhost:6379, or an Upstash/Redis Cloud URL)
//   3. In ragService.js, replace the responseCache Map get/set calls with
//      cacheGet(cacheKey) / cacheSet(cacheKey, value) from this file.

import { createClient } from "redis";

let client;

export async function getRedisClient() {
  if (client) return client;
  client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err.message));
  await client.connect();
  return client;
}

const TTL_SECONDS = 60 * 30; // 30 minutes, mirrors the in-memory cache default

export async function cacheGet(key) {
  const c = await getRedisClient();
  const raw = await c.get(key);
  return raw ? JSON.parse(raw) : null;
}

export async function cacheSet(key, value) {
  const c = await getRedisClient();
  await c.setEx(key, TTL_SECONDS, JSON.stringify(value));
}
