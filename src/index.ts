'use strict';

import * as fs from 'node:fs';
import spawn from 'cross-spawn';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2), { '--': true });

function writeBrowserEnvironment(env: NodeJS.ProcessEnv) {
  const base = fs.realpathSync(process.cwd());
  const dest = argv.d || argv.dest || 'public';
  const debug = argv.debug;
  const path = `${base}/${dest}/__ENV.js`;
  console.info('current-env: Writing runtime env', path);
  if (debug) {
    console.debug(`current-env: ${JSON.stringify(env, null, 2)}`);
  }
  const populate = `window.__ENV = ${JSON.stringify(env)};`;
  fs.writeFileSync(path, populate);
}

function resolveFile(file: string) {
  const path = fs.realpathSync(process.cwd());
  return `${path}/${file}`;
}

function getEnvFiles() {
  const envKey = argv.e || argv.env || '';
  const envVal = process.env[envKey] ?? '';
  const path = argv.p || argv.path || '';
  return [
    resolveFile(path),
    resolveFile(`.env.${envVal}`),
    resolveFile('.env.local'),
    resolveFile('.env'),
  ].filter(Boolean);
}

const dotenvFiles = getEnvFiles();

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    dotenvExpand.expand(
      dotenv.config({
        path: dotenvFile,
      })
    );
  }
});

writeBrowserEnvironment(process.env);

if (argv['--'] && argv['--'].length) {
  spawn(argv['--'][0], argv['--'].slice(1), { stdio: 'inherit' }).on(
    'exit',
    function (exitCode) {
      process.exit(exitCode);
    }
  );
}
