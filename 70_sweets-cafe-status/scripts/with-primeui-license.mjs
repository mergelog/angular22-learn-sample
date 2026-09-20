import { config } from 'dotenv';
import { spawn } from 'node:child_process';

config({ quiet: true });

const [command, ...args] = process.argv.slice(2);

if (!command) {
  throw new Error('実行する Angular CLI コマンドを指定してください。');
}

// PrimeNG はブラウザ上でライセンス検証するため、必要なキーだけを明示的に公開する。
const licenseDefinition = `PRIMEUI_LICENSE_KEY=${JSON.stringify(process.env.PRIMEUI_LICENSE_KEY ?? '')}`;
const child = spawn(command, [...args, '--define', licenseDefinition], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
