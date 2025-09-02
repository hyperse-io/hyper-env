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
          ...dotenvOptions,
          path: dotenvFile,
        })
      );
    }
  });
};
