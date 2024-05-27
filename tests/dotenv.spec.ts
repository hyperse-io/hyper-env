import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vi } from 'vitest';
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
    const files = [
      '.env',
      '.env.local',
      '.env.test',
      '.env.staging',
      '.env.staging2',
      '.env.production',
    ];
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

  it('parses env without next .env', async () => {
    writeEnvFile('.env', 'NEXT_PUBLIC_FOO=dev');

    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","dev"/);
  });

  it('parse env files via --env arg', async () => {
    writeEnvFile('.env.staging', 'NEXT_PUBLIC_FOO=env_staging');
    // APP_ENV=staging hyper-env --env APP_ENV -- next build
    vi.stubEnv('APP_ENV', 'staging');
    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--env',
      'APP_ENV',
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","env_staging"/);
  });

  it('parse env files via --e arg', async () => {
    writeEnvFile('.env.staging2', 'NEXT_PUBLIC_FOO=e_staging2');
    // APP_ENV=staging2 hyper-env --env APP_ENV -- next build
    vi.stubEnv('APP_ENV', 'staging2');
    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--env',
      'APP_ENV',
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","e_staging2"/);
  });

  it('parses env files via --path arg', async () => {
    writeEnvFile('.env.staging', 'NEXT_PUBLIC_FOO=path_staging');

    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--path',
      '.env.staging',
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","path_staging"/);
  });

  it('parses env files via --p arg', async () => {
    writeEnvFile('.env.staging2', 'NEXT_PUBLIC_FOO=p_staging2');

    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--p',
      '.env.staging2',
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","p_staging2"/);
  });

  it('has order of priority', async () => {
    writeEnvFile('.env.staging', 'NEXT_PUBLIC_FOO=staging');
    writeEnvFile('.env.local', 'NEXT_PUBLIC_FOO=local');
    writeEnvFile('.env.production', 'NEXT_PUBLIC_FOO=production');
    writeEnvFile('.env', 'NEXT_PUBLIC_FOO=dev');

    vi.stubEnv('APP_ENV', 'production');

    const testRes1 = await runTsCliMock(
      cliPath,
      '--p',
      '.env.staging',
      '--e',
      'APP_ENV',
      '--',
      'next',
      'build'
    );

    expect(testRes1.stderr).toBe('');
    expect(testRes1.stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","staging"/);

    const testRes2 = await runTsCliMock(
      cliPath,
      '--e',
      'APP_ENV',
      '--p',
      '.env.staging',
      '--',
      'next',
      'build'
    );

    expect(testRes2.stderr).toBe('');
    expect(testRes2.stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","staging"/);
  });

  it('has no args with order of priority', async () => {
    writeEnvFile('.env.development', 'NEXT_PUBLIC_FOO=development');
    writeEnvFile('.env.production', 'NEXT_PUBLIC_FOO=production');
    writeEnvFile('.env.local', 'NEXT_PUBLIC_FOO=local');
    writeEnvFile('.env.test', 'NEXT_PUBLIC_FOO=test');
    writeEnvFile('.env', 'NEXT_PUBLIC_FOO=dev');

    const { stderr, stdout } = await runTsCliMock(
      cliPath,
      '--',
      'next',
      'build'
    );
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","production"/);
  });
});
