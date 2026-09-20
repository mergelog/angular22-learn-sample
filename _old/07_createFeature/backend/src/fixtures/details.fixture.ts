import type { Detail, DetailHistoryItem } from '../contracts/details.contract.js';

export const details: readonly Detail[] = [
  {
    id: 'detail-001',
    title: 'First detail',
    description: 'Stub data for the first detail.',
    status: 'active',
  },
  {
    id: 'detail-002',
    title: 'Second detail',
    description: 'Stub data for the second detail.',
    status: 'completed',
  },
];

export const detailHistory: Readonly<Record<string, readonly DetailHistoryItem[]>> = {
  'detail-001': [
    {
      id: 'history-001',
      occurredAt: '2026-09-01T09:00:00.000Z',
      type: 'created',
    },
    {
      id: 'history-002',
      occurredAt: '2026-09-02T12:30:00.000Z',
      type: 'updated',
    },
  ],
  'detail-002': [
    {
      id: 'history-003',
      occurredAt: '2026-09-01T10:00:00.000Z',
      type: 'created',
    },
  ],
};
