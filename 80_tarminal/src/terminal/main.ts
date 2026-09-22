import '@angular/compiler';

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { runNgRxExample } from './examples/ngrx';
import { runSignalExample } from './examples/signal';
import { runSignalStoreExample } from './examples/signal-store';
import { runTypeScriptExample } from './examples/typescript';
import { learn01Test } from './t04_store/learn-01-test/learn-01-test';
import { runDistinctUntilKeyChangedExample } from './t04_store/learn-02-distinct-until-key-changed/learn-02-distinct-until-key-changed';
import { runThrottleTimeExample } from './t04_store/learn-03-throttle-time/learn-03-throttle-time';
import { runFinalizeExample } from './t04_store/learn-04-finalize/learn-04-finalize';
import { runExpandReduceExample } from './t04_store/learn-05-expand-reduce/learn-05-expand-reduce';
import { runTimerTakeWhileTakeUntilExample } from './t04_store/learn-06-timer-take-while-take-until/learn-06-timer-take-while-take-until';
import { free } from './free/free';

const once = process.argv.includes('--once');
const port = 3200;
const selectedExampleIndex = process.argv
  .find((argument) => argument.startsWith('--run-example-index='))
  ?.slice('--run-example-index='.length);
const examples: Array<() => void> = [];

function run(example: () => void): void {
  examples.push(example);
}

function runExamples(): void {
  // run(learn01Test);
  // run(runDistinctUntilKeyChangedExample);
  // run(runThrottleTimeExample);
  // run(runFinalizeExample);
  // run(runExpandReduceExample);
  run(runTimerTakeWhileTakeUntilExample);

  // 初期サンプル
  // run(runTypeScriptExample);
  // run(runSignalExample);
  // run(runNgRxExample);
  // run(runSignalStoreExample);

  // run(free);
}

function runExample(index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', fileURLToPath(import.meta.url), `--run-example-index=${index}`],
      { stdio: 'inherit' },
    );

    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Example ${index} exited with ${signal ?? code}`));
      }
    });
  });
}

async function runRegisteredExamples(): Promise<void> {
  for (const index of examples.keys()) {
    await runExample(index);
  }
}

function startExamples(): void {
  void runRegisteredExamples().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

runExamples();

if (selectedExampleIndex !== undefined) {
  const index = Number(selectedExampleIndex);
  if (Number.isInteger(index) && index >= 0 && index < examples.length) {
    examples[index]();
  } else {
    console.error(`Unknown example index: ${selectedExampleIndex}`);
    process.exitCode = 1;
  }
} else if (once) {
  startExamples();
} else {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('80_tarminal: examples run in the terminal.\n');
  });

  server.listen(port, '127.0.0.1', () => {
    startExamples();
    // console.log(`Listening on http://127.0.0.1:${port}`);
  });
}
