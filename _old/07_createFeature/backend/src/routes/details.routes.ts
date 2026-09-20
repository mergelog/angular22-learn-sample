import type { FastifyInstance } from 'fastify';

import { detailHistory, details } from '../fixtures/details.fixture.js';

interface DetailParams {
  detailId: string;
}

export async function detailsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => ({ items: details }));

  app.get<{ Params: DetailParams }>('/:detailId', async (request, reply) => {
    const detail = details.find(({ id }) => id === request.params.detailId);

    if (!detail) {
      return reply.code(404).send({
        code: 'DETAIL_NOT_FOUND',
        message: `Detail ${request.params.detailId} was not found.`,
      });
    }

    return detail;
  });

  app.get<{ Params: DetailParams }>('/:detailId/history', async (request, reply) => {
    const detail = details.find(({ id }) => id === request.params.detailId);

    if (!detail) {
      return reply.code(404).send({
        code: 'DETAIL_NOT_FOUND',
        message: `Detail ${request.params.detailId} was not found.`,
      });
    }

    return {
      items: detailHistory[detail.id] ?? [],
    };
  });
}
