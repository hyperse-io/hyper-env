import fs, { rmSync, writeFileSync } from 'fs';
import fsPromise from 'fs/promises';
import { join } from 'path';
import { getDirname } from '../src/helpers/get-dir-name.js';
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
      rmSync(node_modules, {
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
    const repoCwd = process.cwd();
    const projectCwd = process.cwd();
    await nextStandalone(['--repoCwd', repoCwd, '--projectCwd', projectCwd]);

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
    await nextStandalone(['--repoCwd', fixtureCwd, '--projectCwd', fixtureCwd]);
    for (const envFile of Object.keys(envFiles)) {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(
        join(fixtureCwd, envFile),
        join(fixtureCwd, '.next/standalone', envFile)
      );
    }
  });

  it('should correct handle argv dummy standard parameters', async () => {
    const repoCwd = '/fromBase';
    const projectCwd = '/copyToBase';
    await nextStandalone(['--repoCwd', repoCwd, '--projectCwd', projectCwd]);
    [
      [binFile, `${projectCwd}/.next${process.cwd()}/bin/hyper-env.mjs`],
    ].forEach(([from, to]) => {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(from, to);
    });
    expect(fsPromise.copyFile).toHaveBeenCalledTimes(1);
  });

  it('should correct handle argv dummy standard parameters with alias', async () => {
    const repoCwd = '/fromBase';
    const projectCwd = '/copyToBase';
    await nextStandalone(['-r', repoCwd, '-p', projectCwd]);
    [
      [binFile, `${projectCwd}/.next${process.cwd()}/bin/hyper-env.mjs`],
    ].forEach(([from, to]) => {
      expect(fsPromise.copyFile).toHaveBeenCalledWith(from, to);
    });
    expect(fsPromise.copyFile).toHaveBeenCalledTimes(1);
  });
});
