import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { after, before, test } from 'node:test';

import { buildApp } from '../src/app.js';
import type { DashboardResponse } from '../src/contracts/dashboard.contract.js';

const dataDirectory = await mkdtemp(join(tmpdir(), '07-create-feature-backend-'));
const lotDataFilePath = join(dataDirectory, 'lots.json');
const app = buildApp({
  apiResponseDelayMs: 0,
  lotDataFilePath,
  lotUpdateIntervalMs: 60_000,
});

before(async () => {
  await app.ready();
});

after(async () => {
  await app.close();
  await rm(dataDirectory, { recursive: true });
});

test('returns the health status', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/health',
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    service: '07-create-feature-stub',
    status: 'ok',
  });
});

test('returns stored lots and fails every third dashboard request', async () => {
  const firstResponse = await app.inject({
    method: 'GET',
    url: '/api/dashboard',
  });
  const secondResponse = await app.inject({
    method: 'GET',
    url: '/api/dashboard',
  });
  const thirdResponse = await app.inject({
    method: 'GET',
    url: '/api/dashboard',
  });
  const firstDashboard = firstResponse.json<DashboardResponse>();
  const secondDashboard = secondResponse.json<DashboardResponse>();
  const storedLots = JSON.parse(await readFile(lotDataFilePath, 'utf8'));

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(firstDashboard.items.length, 2);
  assert.deepEqual(Object.keys(firstDashboard.items[0] ?? {}), [
    'lotName',
    'waferCount',
    'accuracy',
    'status',
    'updatedAt',
  ]);
  assert.ok(firstDashboard.items.every(({ status }) => status === 'processing'));
  assert.deepEqual(firstDashboard, secondDashboard);
  assert.deepEqual(storedLots, secondDashboard.items);
  assert.equal(thirdResponse.statusCode, 500);
  assert.deepEqual(thirdResponse.json(), {
    code: 'DASHBOARD_TEMPORARY_FAILURE',
    message: 'The dashboard stub failed temporarily.',
  });
});

test('updates lot values in the backend loop', async () => {
  const loopDataDirectory = await mkdtemp(join(tmpdir(), '07-create-feature-loop-'));
  const loopDataFilePath = join(loopDataDirectory, 'lots.json');
  const loopApp = buildApp({
    apiResponseDelayMs: 0,
    lotDataFilePath: loopDataFilePath,
    lotUpdateIntervalMs: 10,
  });

  try {
    await loopApp.ready();

    const firstResponse = await loopApp.inject({
      method: 'GET',
      url: '/api/dashboard',
    });
    const firstDashboard = firstResponse.json<DashboardResponse>();

    await delay(30);

    const secondResponse = await loopApp.inject({
      method: 'GET',
      url: '/api/dashboard',
    });
    const secondDashboard = secondResponse.json<DashboardResponse>();

    assert.notEqual(firstDashboard.items[0]?.accuracy, secondDashboard.items[0]?.accuracy);
    assert.notEqual(firstDashboard.items[0]?.updatedAt, secondDashboard.items[0]?.updatedAt);
  } finally {
    await loopApp.close();
    await rm(loopDataDirectory, { recursive: true });
  }
});

test('returns a detail and its history', async () => {
  const detailResponse = await app.inject({
    method: 'GET',
    url: '/api/details/detail-001',
  });
  const historyResponse = await app.inject({
    method: 'GET',
    url: '/api/details/detail-001/history',
  });

  assert.equal(detailResponse.statusCode, 200);
  assert.equal(detailResponse.json().id, 'detail-001');
  assert.equal(historyResponse.statusCode, 200);
  assert.equal(historyResponse.json().items.length, 2);
});

test('returns 404 for an unknown detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/details/unknown',
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, 'DETAIL_NOT_FOUND');
});
