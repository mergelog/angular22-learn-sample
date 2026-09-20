import { buildApp } from './app.js';

const host = process.env.STUB_SERVER_HOST ?? '127.0.0.1';
const port = Number.parseInt(process.env.STUB_SERVER_PORT ?? '3000', 10);
const apiResponseDelayMs = Number.parseInt(process.env.API_RESPONSE_DELAY_MS ?? '1000', 10);
const lotUpdateIntervalMs = Number.parseInt(process.env.LOT_UPDATE_INTERVAL_MS ?? '3000', 10);
const logLevel = process.env.STUB_SERVER_LOG_LEVEL ?? 'warn';

const app = buildApp({
  apiResponseDelayMs,
  logger: { level: logLevel },
  lotUpdateIntervalMs,
});

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
