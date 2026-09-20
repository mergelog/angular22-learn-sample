import cors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { fileURLToPath } from 'node:url';

import { defaultLots } from './fixtures/dashboard.fixture.js';
import { registerApiResponseDelayHook } from './hooks/api-response-delay.hook.js';
import { JsonLotRepository } from './repositories/json-lot.repository.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { detailsRoutes } from './routes/details.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { LotUpdateScheduler } from './services/lot-update.scheduler.js';

const defaultLotDataFilePath = fileURLToPath(new URL('../data/lots.json', import.meta.url));

export interface BuildAppOptions extends FastifyServerOptions {
  apiResponseDelayMs?: number;
  lotDataFilePath?: string;
  lotUpdateIntervalMs?: number;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const {
    apiResponseDelayMs = 1_000,
    lotDataFilePath = defaultLotDataFilePath,
    lotUpdateIntervalMs = 3_000,
    ...fastifyOptions
  } = options;
  const app = Fastify(fastifyOptions);
  const lotRepository = new JsonLotRepository(lotDataFilePath, defaultLots);
  const lotUpdateScheduler = new LotUpdateScheduler(lotRepository, lotUpdateIntervalMs, app.log);

  app.register(cors, {
    origin: true,
  });

  registerApiResponseDelayHook(app, apiResponseDelayMs);

  app.register(healthRoutes);
  app.register(dashboardRoutes, {
    prefix: '/api/dashboard',
    lotRepository,
  });
  app.register(detailsRoutes, { prefix: '/api/details' });

  app.addHook('onReady', async () => {
    await lotUpdateScheduler.start();
  });

  app.addHook('onClose', async () => {
    await lotUpdateScheduler.stop();
  });

  return app;
}
