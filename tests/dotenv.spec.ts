import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTsCliMock } from './run-cli-program.js';

const getDirname = (url: string, ...paths: string[]) => {
  return join(dirname(fileURLToPath(url)), ...paths);
};

const cliPath = getDirname(import.meta.url, './cli.ts');

function writeEnvFile(name: string, text: string) {
  const path = fs.realpathSync(process.cwd());
  fs.writeFileSync(`${path}/${name}`, text);
}

function readNextPage() {
  const manifest = JSON.parse(
    fs.readFileSync(
      getDirname(import.meta.url, '../.next/build-manifest.json'),
      'utf-8'
    )
  );
  const pageIndexPath = manifest.pages['/'].slice(-1)[0];
  return fs.readFileSync(
    getDirname(import.meta.url, '../.next', pageIndexPath),
    'utf-8'
  );
}

describe('test suites of hyper env', () => {
  beforeAll(() => {
    const files = ['.env', '.env.local', '.env.test', '.env.production'];
    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.rmSync(file);
      }
    }
  });

  it('parses env without customized env', async () => {
    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).not.toMatch(/foo: bar/);
  });

  it('parses env without next.env', async () => {
    writeEnvFile('.env.test', 'NEXT_PUBLIC_FOO=test');

    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","test"/);
  });

  // it('parses env with --path,-p', async () => {
  //   writeEnvFile('.env.staging', 'FOO=bar');

  //   const { stderr, stdout } = await runTsCliMock(
  //     cliPath,
  //     '--path',
  //     '.env.staging',
  //     '--',
  //     'next',
  //     'build'
  //   );
  //   expect(stderr).toBe('');
  //   expect(stdout).toMatch(/foo: bar/);
  //   expect(stdout).toMatch(/node_env: test/);
  //   expect(process.env).not.toMatchObject({
  //     FOO: 'bar',
  //   });
  // });

  // it('parses env with --path,-p', async () => {
  //   writeEnvFile('.env', 'FOO=bar');

  //   const { stderr, stdout } = await runTsCliMock(
  //     cliPath,
  //     '--path',
  //     '.env',
  //     '--',
  //     'next',
  //     'build'
  //   );
  //   expect(stderr).toBe('');
  //   expect(stdout).toMatch(/foo: bar/);
  //   expect(stdout).toMatch(/node_env: test/);
  //   expect(process.env).not.toMatchObject({
  //     FOO: 'bar',
  //   });
  // });
});
