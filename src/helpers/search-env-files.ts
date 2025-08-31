import { realpathSync } from 'node:fs';

type SearchEnvFilesProps = {
  envKey: string;
  envFilePath: string;
};

function resolveFile(file: string) {
  const path = realpathSync(process.cwd());
  return `${path}/${file}`;
}

/** resolveFile is used to resolve the given filename to an absolute path under the current working directory
 * searchEnvFiles generates a prioritized list of .env file paths based on the provided environment variable key and file path
 * @param envKey the key of the environment variable
 * @param envFilePath the path of the environment file
 * @returns a prioritized list of .env file paths
 */
export const searchEnvFiles = ({
  envKey,
  envFilePath,
}: SearchEnvFilesProps) => {
  const envVal = process.env[envKey] ?? '';
  return [
    resolveFile(envFilePath),
    resolveFile(`.env.${envVal}`),
    resolveFile('.env.local'),
    resolveFile('.env'),
  ].filter(Boolean);
};
