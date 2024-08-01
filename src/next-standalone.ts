import fs from 'fs';
import fsPromise from 'fs/promises';
import minimist from 'minimist';
import { dirname, isAbsolute, relative, resolve } from 'path';
import { nodeFileTrace } from '@vercel/nft';
import { getDirname } from './get-dir-name.js';
import { fileWalk } from './utils.js';

type Argv = {
  p: string;
  /**
   * THe project root folder, normally it always `process.cwd()`, it can be a relative path from the repository root folder.
   * @example `docs` for `monorepo`
   * @default `process.cwd()`
   */
  projectCwd: string;

  r: string;
  /**
   * The repository root folder
   * @default `process.cwd()`
   */
  repoCwd: string;
};

/**
 * https://github.com/vercel/next.js/discussions/59127
 * https://nextjs.org/docs/pages/api-reference/next-config-js/output
 * Next standalone will that copies only the necessary files for a production deployment including select files in node_modules.
 * For `Dockerfile`, it will lose `hyper-env` command, we will also do a staticlly ananlysis all dependencies of `hyper-env` and manually copy them to the `node_modules` folder.
 */
export const nextStandalone = async (args: string[]) => {
  const binFile = getDirname(import.meta.url, '../bin/hyper-env.mjs');
  const defaultRepoCwd = /\/node_modules\//.test(binFile)
    ? binFile.split('node_modules')[0]
    : process.cwd();

  const defaultProjectCwd = process.cwd();

  const argv = minimist<Argv>(args, {
    '--': true,
    alias: {
      r: 'repoCwd',
      p: 'projectCwd',
    },
    default: {
      repoCwd: defaultRepoCwd,
      projectCwd: defaultProjectCwd,
    },
  });

  const repoCwd = resolve(defaultRepoCwd, argv.repoCwd);
  const projectCwd = resolve(repoCwd, argv.projectCwd);

  const { fileList } = await nodeFileTrace([binFile], {
    base: repoCwd,
  });

  const envFiles = await fileWalk(['.env', '.env.*'], {
    cwd: projectCwd,
    absolute: true,
  });

  for (const absEnvFile of envFiles) {
    fileList.add(absEnvFile);
  }

  for (const filePath of fileList) {
    const copyFrom = resolve(repoCwd, filePath);
    const copyTo = resolve(
      projectCwd,
      '.next/standalone',
      isAbsolute(filePath) ? relative(projectCwd, filePath) : filePath
    );
    if (!fs.existsSync(dirname(copyTo))) {
      fs.mkdirSync(dirname(copyTo), { recursive: true });
    }
    await fsPromise.copyFile(copyFrom, copyTo);
  }
};
