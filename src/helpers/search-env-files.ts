import { realpathSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

type SearchEnvFilesProps = {
  envKey: string;
  envFilePath: string;
};

const base = realpathSync(process.cwd());

function resolveFile(file: string) {
  return resolvePath(base, file);
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
  const envVal = (process.env[envKey] ?? '').trim();
  const cleanedPath = envFilePath.trim();
  const candidates = [
    cleanedPath ? resolveFile(cleanedPath) : null,
    envVal ? resolveFile(`.env.${envVal}`) : null,
    resolveFile('.env.local'),
    resolveFile('.env'),
  ].filter(Boolean) as string[];
  return Array.from(new Set(candidates));
};
