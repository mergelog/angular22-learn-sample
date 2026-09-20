import type { FastifyInstance } from 'fastify';

import type { DashboardErrorResponse, DashboardResponse } from '../contracts/dashboard.contract.js';
import type { LotRepository } from '../repositories/lot.repository.js';

interface DashboardRouteOptions {
  lotRepository: LotRepository;
}

export async function dashboardRoutes(
  app: FastifyInstance,
  options: DashboardRouteOptions,
): Promise<void> {
  let requestCount = 0;

  app.get<{ Reply: DashboardResponse | DashboardErrorResponse }>('/', async (_request, reply) => {
    requestCount += 1;

    if (requestCount % 3 === 0) {
      // console.log('Dashboard stub: 3回に1回は意図的に失敗させています。');

      return reply.code(500).send({
        code: 'DASHBOARD_TEMPORARY_FAILURE',
        message: 'The dashboard stub failed temporarily.',
      });
    }

    const items = await options.lotRepository.findAll();

    return { items };
  });
}
