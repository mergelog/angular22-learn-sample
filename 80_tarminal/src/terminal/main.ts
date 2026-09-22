import '@angular/compiler';

import { createServer } from 'node:http';
import { runNgRxExample } from './examples/ngrx';
import { runSignalExample } from './examples/signal';
import { runSignalStoreExample } from './examples/signal-store';
import { runTypeScriptExample } from './examples/typescript';
import { learn01Test } from './t04_store/learn-01-test/learn-01-test';
import { runDistinctUntilKeyChangedExample } from './t04_store/learn-02-distinct-until-key-changed/learn-02-distinct-until-key-changed';

const once = process.argv.includes('--once');
const port = 3200;

function runExamples(): void {

  learn01Test()
  runDistinctUntilKeyChangedExample();
  
  // 初期サンプル
  // runTypeScriptExample();
  // runSignalExample();
  // runNgRxExample();
  // runSignalStoreExample();
}

if (once) {
  runExamples();
} else {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('80_tarminal: examples run in the terminal.\n');
  });

  server.listen(port, '127.0.0.1', () => {
    runExamples();
    // console.log(`Listening on http://127.0.0.1:${port}`);
  });
}
