import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTsScript } from '@hyperse/exec-program';
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
  beforeEach(() => {
    const files = [
      '.env',
      '.env.local',
      '.env.test',
      '.env.staging',
      '.env.staging2',
      '.env.production',
      '.env.development',
    ];
    for (const file of files) {
      if (fs.existsSync(file)) {
        fs.rmSync(file);
      }
    }
  });

  it('parses env without customized env', async () => {
    const { stderr, stdout } = await runTsScript(cliPath, [
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).not.toMatch(/foo: bar/);
  });

  it('parses env with next .env', async () => {
    writeEnvFile('.env', 'NEXT_PUBLIC_FOO=dev');

    const { stderr, stdout } = await runTsScript(cliPath, [
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","dev"/);
  });

  it('parse env files via --env arg', async () => {
    writeEnvFile('.env.staging', 'NEXT_PUBLIC_FOO=env_staging');
    // hyper-env APP_ENV=staging hyper-env --env APP_ENV -- next build
    vi.stubEnv('APP_ENV', 'staging');
    const { stderr, stdout } = await runTsScript(cliPath, [
      '--env',
      'APP_ENV',
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","env_staging"/);
  });

  it('parse env files via -e arg', async () => {
    writeEnvFile('.env.staging2', 'NEXT_PUBLIC_FOO=e_staging2');
    // APP_ENV=staging2 hyper-env -e APP_ENV -- next build
    vi.stubEnv('APP_ENV', 'staging2');
    const { stderr, stdout } = await runTsScript(cliPath, [
      '-e',
      'APP_ENV',
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","e_staging2"/);
  });

  it('parses env files via --path arg', async () => {
    writeEnvFile('.env.staging', 'NEXT_PUBLIC_FOO=path_staging');
    // hyper-env --path .env.staging -- next build
    const { stderr, stdout } = await runTsScript(cliPath, [
      '--path',
      '.env.staging',
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","path_staging"/);
  });

  it('parses env files via -p arg', async () => {
    writeEnvFile('.env.staging2', 'NEXT_PUBLIC_FOO=p_staging2');
    // hyper-env -p .env.staging2 -- next build
    const { stderr, stdout } = await runTsScript(cliPath, [
      '-p',
      '.env.staging2',
      '--',
      'next',
      'build',
    ]);
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
    // APP_ENV=production  hyper-env -p .env.staging -e APP_ENV -- next build
    const testRes1 = await runTsScript(cliPath, [
      '-p',
      '.env.staging',
      '-e',
      'APP_ENV',
      '--',
      'next',
      'build',
    ]);

    expect(testRes1.stderr).toBe('');
    expect(testRes1.stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","staging"/);

    // APP_ENV=production  hyper-env -e APP_ENV -p .env.staging  -- next build
    const testRes2 = await runTsScript(cliPath, [
      '-e',
      'APP_ENV',
      '-p',
      '.env.staging',
      '--',
      'next',
      'build',
    ]);

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

    // hyper-env -- next build
    const { stderr, stdout } = await runTsScript(cliPath, [
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    expect(readNextPage()).toMatch(/"hello:","production"/);
  });
});
