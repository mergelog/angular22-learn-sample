import '@angular/compiler';

import { createServer } from 'node:http';
import { runNgRxExample } from './examples/ngrx';
import { runSignalExample } from './examples/signal';
import { runSignalStoreExample } from './examples/signal-store';
import { runTypeScriptExample } from './examples/typescript';
import { t01 } from './free-canvas/t01_canvas';

const once = process.argv.includes('--once');
const port = 3200;

function runExamples(): void {

  t01()
  
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
