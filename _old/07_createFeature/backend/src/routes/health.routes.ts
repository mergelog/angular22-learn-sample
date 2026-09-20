import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    service: '07-create-feature-stub',
    status: 'ok',
  }));
}
