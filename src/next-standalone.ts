import fs from 'fs';
import fsPromise from 'fs/promises';
import minimist from 'minimist';
import { dirname, resolve } from 'path';
import { nodeFileTrace } from '@vercel/nft';
import { fileWalk } from './file-walk.js';
import { getDirname } from './get-dir-name.js';

type Argv = {
  f: string;
  fromBase: string;
  c: string;
  copyToBase: string;
};

/**
 * https://github.com/vercel/next.js/discussions/59127
 * https://nextjs.org/docs/pages/api-reference/next-config-js/output
 * Next standalone will that copies only the necessary files for a production deployment including select files in node_modules.
 * For `Dockerfile`, it will lose `hyper-env` command, we will also do a staticlly ananlysis all dependencies of `hyper-env` and manually copy them to the `node_modules` folder.
 */
export const nextStandalone = async (args: string[]) => {
  const binFile = getDirname(import.meta.url, '../bin/hyper-env.mjs');
  const argv = minimist<Argv>(args, {
    '--': true,
    alias: {
      f: 'fromBase',
      c: 'copyToBase',
    },
    default: {
      fromBase: process.cwd(),
      copyToBase: process.cwd(),
    },
  });

  const { fromBase, copyToBase } = argv;

  const { fileList } = await nodeFileTrace([binFile], {
    base: fromBase,
  });

  const envFiles = await fileWalk(['.env', '.env.*'], {
    cwd: fromBase,
    absolute: false,
  });

  for (const absEnvFile of envFiles) {
    fileList.add(absEnvFile);
  }

  for (const filePath of fileList) {
    const copyTo = resolve(copyToBase, '.next/standalone', filePath);
    if (!fs.existsSync(dirname(copyTo))) {
      fs.mkdirSync(dirname(copyTo), { recursive: true });
    }
    await fsPromise.copyFile(
      resolve(fromBase, filePath),
      resolve(copyToBase, '.next/standalone', filePath)
    );
  }
};
