import dotenv, { type DotenvConfigOptions } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'node:fs';

/** setupDotenv is used to setup the dotenv files
 * @param dotenvFiles the list of dotenv files to setup
 * @param dotenvOptions the options to pass to the dotenv config
 * */
export const setupDotenv = (
  dotenvFiles: string[],
  dotenvOptions: Omit<DotenvConfigOptions, 'path'> = {}
) => {
  dotenvFiles.forEach((dotenvFile) => {
    if (existsSync(dotenvFile)) {
      dotenvExpand.expand(
        dotenv.config({
          // `dotenv@18` started logging `◇ injected env (n) from <path>` to
          // stderr on every successful load. Defaulting to quiet keeps the
          // pre-v18 silent behaviour (and keeps stdout/stderr clean for the
          // CLI), while callers can still opt back in via `quiet: false`.
          quiet: true,
          ...dotenvOptions,
          path: dotenvFile,
        })
      );
    }
  });
};
