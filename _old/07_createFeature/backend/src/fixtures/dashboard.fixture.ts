import type { Lot } from '../contracts/dashboard.contract.js';

export const defaultLots: readonly Lot[] = [
  {
    lotName: 'LOT-2026-001',
    waferCount: 25,
    accuracy: 99.8,
    status: 'processing',
    updatedAt: '2026-09-03T09:00:00.000Z',
  },
  {
    lotName: 'LOT-2026-002',
    waferCount: 24,
    accuracy: 99.5,
    status: 'processing',
    updatedAt: '2026-09-03T09:05:00.000Z',
  },
];
