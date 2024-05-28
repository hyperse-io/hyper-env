import spawn from 'cross-spawn';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import minimist from 'minimist';
import { existsSync, realpathSync } from 'node:fs';

function resolveFile(file: string) {
  const path = realpathSync(process.cwd());
  return `${path}/${file}`;
}

type Argv = {
  e: string;
  env: string;
  p: string;
  path: string;
};

function getEnvFiles(argv: minimist.ParsedArgs & Argv) {
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

export const main = (args: string[]) => {
  const argv = minimist<Argv>(args, {
    '--': true,
    alias: {
      e: 'env',
      p: 'path',
    },
    default: {
      e: 'APP_ENV',
      p: '',
    },
  });

  const dotenvFiles = getEnvFiles(argv);

  dotenvFiles.forEach((dotenvFile) => {
    if (existsSync(dotenvFile)) {
      dotenvExpand.expand(
        dotenv.config({
          path: dotenvFile,
        })
      );
    }
  });

  if (argv['--'] && argv['--'].length) {
    spawn(argv['--'][0], argv['--'].slice(1), {
      stdio: 'inherit',
    }).on('exit', function (exitCode) {
      process.exit(exitCode);
    });
  }
};
