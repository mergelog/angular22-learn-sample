import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const backendHost = process.env.STUB_SERVER_HOST ?? '127.0.0.1';
const backendPort = process.env.STUB_SERVER_PORT ?? '3000';
const healthUrl = `http://${backendHost}:${backendPort}/health`;
const angularCliPath = resolve('node_modules/@angular/cli/bin/ng.js');
const frontendPort = process.env.FRONTEND_PORT;

let backendProcess;
let frontendProcess;
let isShuttingDown = false;

async function isBackendRunning() {
  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(1000),
    });
    const body = await response.json();

    return response.ok && body.service === '07-create-feature-stub' && body.status === 'ok';
  } catch {
    return false;
  }
}

async function waitForBackend() {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if (await isBackendRunning()) {
      return;
    }

    if (backendProcess?.exitCode !== null) {
      throw new Error('Fastify stub server exited before becoming ready.');
    }

    await delay(200);
  }

  throw new Error(`Fastify stub server did not become ready at ${healthUrl}.`);
}

function startBackend() {
  console.log(`Starting Fastify stub server at http://${backendHost}:${backendPort}...`);

  backendProcess = spawn(
    process.execPath,
    ['--watch', '--import', 'tsx', 'backend/src/server.ts'],
    {
      env: process.env,
      stdio: 'inherit',
    },
  );
}

function startFrontend() {
  console.log('Starting Angular development server...');

  const angularArguments = [angularCliPath, 'serve'];

  if (frontendPort) {
    angularArguments.push('--port', frontendPort);
  }

  frontendProcess = spawn(process.execPath, angularArguments, {
    env: process.env,
    stdio: 'inherit',
  });

  frontendProcess.once('exit', (code, signal) => {
    shutdown(signal ?? 'SIGTERM', code ?? 0);
  });
}

function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  frontendProcess?.kill(signal);
  backendProcess?.kill(signal);
  process.exitCode = exitCode;
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

try {
  if (await isBackendRunning()) {
    console.log(`Fastify stub server is already running at http://${backendHost}:${backendPort}.`);
  } else {
    startBackend();
    await waitForBackend();
  }

  startFrontend();
} catch (error) {
  console.error(error.message);
  shutdown('SIGTERM', 1);
}
