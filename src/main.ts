import { spawn } from 'child_process';
import minimist from 'minimist';
import { searchEnvFiles } from './helpers/search-env-files.js';
import { setupDotenv } from './helpers/setup-dotenv.js';

type Argv = {
  e: string;
  env: string;
  p: string;
  path: string;
};

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

  const envKey = argv.env || argv.e || '';
  const envFilePath = argv.path || argv.p || '';

  const dotenvFiles = searchEnvFiles({
    envKey,
    envFilePath,
  });

  setupDotenv(dotenvFiles);

  if (argv['--'] && argv['--'].length) {
    spawn(argv['--'][0], argv['--'].slice(1), {
      stdio: 'inherit',
    }).on('exit', function (exitCode) {
      process.exit(exitCode);
    });
  }
};
