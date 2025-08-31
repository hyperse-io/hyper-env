import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'node:fs';

/** setupDotenv is used to setup the dotenv files
 * @param dotenvFiles the list of dotenv files to setup
 * */
export const setupDotenv = (dotenvFiles: string[]) => {
  dotenvFiles.forEach((dotenvFile) => {
    if (existsSync(dotenvFile)) {
      dotenvExpand.expand(
        dotenv.config({
          path: dotenvFile,
        })
      );
    }
  });
};
