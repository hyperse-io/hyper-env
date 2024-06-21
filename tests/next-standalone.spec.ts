import fs, { rmdirSync, rmSync, writeFileSync } from 'fs';
import fsPromise from 'fs/promises';
import { join } from 'path';
import { getDirname } from '../src/get-dir-name.js';
import { nextStandalone } from '../src/next-standalone.js';

describe('Next Standalone', () => {
  const fixtureCwd = getDirname(import.meta.url);
  const binFile = getDirname(import.meta.url, '../bin/hyper-env.mjs');
  const envFiles = {
    '.env': '',
    '.env.dev': '',
    '.env.inte': '',
    '.env.rc': '',
    '.env.prod': '',
  };

  beforeAll(() => {
    for (const [envFile] of Object.entries(envFiles)) {
      writeFileSync(join(fixtureCwd, envFile), '');
    }
  });

  afterAll(() => {
    for (const [envFile] of Object.entries(envFiles)) {
      rmSync(join(fixtureCwd, envFile));
    }
  });

  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'mkdirSync');
    vi.spyOn(fsPromise, 'copyFile').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const node_modules = join(process.cwd(), '.next/standalone/node_modules');
    if (fs.existsSync(node_modules)) {
      rmdirSync(node_modules, {
        recursive: true,
      });
    }
  });

  it('should copy only the necessary files with default parameters', async () => {
    await nextStandalone([]);

    const fileList = [
      'bin/hyper-env.mjs',
      'dist/index.js',
      'package.json',
      'node_modules/minimist/package.json',
      'node_modules/minimist/index.js',
      'node_modules/dotenv/package.json',
      'node_modules/dotenv/lib/main.js',
      'node_modules/dotenv-expand/package.json',
      'node_modules/dotenv-expand/lib/main.js',
    ];

    for (const filePath of fileList) {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(
        join(process.cwd(), filePath),
        join(process.cwd(), '.next/standalone', filePath)
      );
    }
  });

  it('should copy only the necessary files with specificed correct parameters', async () => {
    const fromBase = process.cwd();
    const copyToBase = process.cwd();
    await nextStandalone(['--fromBase', fromBase, '--copyToBase', copyToBase]);

    const fileList = [
      'bin/hyper-env.mjs',
      'dist/index.js',
      'package.json',
      'node_modules/minimist/package.json',
      'node_modules/minimist/index.js',
      'node_modules/dotenv/package.json',
      'node_modules/dotenv/lib/main.js',
      'node_modules/dotenv-expand/package.json',
      'node_modules/dotenv-expand/lib/main.js',
    ];

    for (const filePath of fileList) {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(
        join(process.cwd(), filePath),
        join(process.cwd(), '.next/standalone', filePath)
      );
    }
  });

  it('should correct handle copy .env files for workdir', async () => {
    await nextStandalone([
      '--fromBase',
      fixtureCwd,
      '--copyToBase',
      fixtureCwd,
    ]);
    for (const envFile of Object.keys(envFiles)) {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(
        join(fixtureCwd, envFile),
        join(fixtureCwd, '.next/standalone', envFile)
      );
    }
  });

  it('should correct handle argv dummy standard parameters', async () => {
    const fromBase = '/fromBase';
    const copyToBase = '/copyToBase';
    await nextStandalone(['--fromBase', fromBase, '--copyToBase', copyToBase]);
    [
      [
        binFile,
        `${copyToBase}/.next/Users/tianyingchun/Documents/hyperse-io/hyper-env/bin/hyper-env.mjs`,
      ],
    ].forEach(([from, to]) => {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(from, to);
    });
    expect(fsPromise.copyFile).toHaveBeenCalledTimes(1);
  });

  it('should correct handle argv dummy standard parameters with alias', async () => {
    const fromBase = '/fromBase';
    const copyToBase = '/copyToBase';
    await nextStandalone(['-f', fromBase, '-c', copyToBase]);
    [
      [
        binFile,
        `${copyToBase}/.next/Users/tianyingchun/Documents/hyperse-io/hyper-env/bin/hyper-env.mjs`,
      ],
    ].forEach(([from, to]) => {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(from, to);
    });
    expect(fsPromise.copyFile).toHaveBeenCalledTimes(1);
  });
});
