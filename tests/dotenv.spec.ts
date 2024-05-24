import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTsCliMock } from '@armit/commander';

const getDirname = (url: string, ...paths: string[]) => {
  return join(dirname(fileURLToPath(url)), ...paths);
};

const cliPath = getDirname(import.meta.url, '../src/index.ts');

function writeEnvFile(name: string, text: string) {
  const path = fs.realpathSync(process.cwd());
  fs.writeFileSync(`${path}/${name}`, text);
}

test('parses safe env vars and', async () => {
  writeEnvFile('.env', 'FOO=bar');

  await runTsCliMock(cliPath, '--env', '.env');

  expect(process.env).toBe({});

  expect(process.env.FOO).toBe('bar');
});
