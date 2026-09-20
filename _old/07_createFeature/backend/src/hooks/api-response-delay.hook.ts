import type { FastifyInstance } from 'fastify';
import { setTimeout as delay } from 'node:timers/promises';

export function registerApiResponseDelayHook(app: FastifyInstance, delayMs: number): void {
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw new Error('API response delay must be zero or a positive number.');
  }

  app.addHook('preHandler', async (request) => {
    if (delayMs === 0 || !request.url.startsWith('/api/')) {
      return;
    }

    await delay(delayMs);
  });
}
