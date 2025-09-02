import type { DotenvConfigOptions } from 'dotenv';
import { searchEnvFiles } from './helpers/search-env-files.js';
import { setupDotenv } from './helpers/setup-dotenv.js';

export type setupEnvOptions = {
  envKey?: string;
  envFilePath?: string;
  dotenvOptions?: Omit<DotenvConfigOptions, 'path'>;
};

/** setupEnv is used to setup the environment variables from the .env files
 * @param envKey the key of the environment variable
 * @param envFilePath the path of the environment file
 * @returns the environment variables
 */
export const setupEnv = ({
  envKey = '',
  envFilePath = '',
  dotenvOptions = {},
}: setupEnvOptions) => {
  const dotenvFiles = searchEnvFiles({
    envKey,
    envFilePath,
  });
  setupDotenv(dotenvFiles, dotenvOptions);
};
