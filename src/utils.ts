import type { Options } from 'globby';
import { globby } from 'globby';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const fileWalk = (
  pattern: string | readonly string[],
  options: Options = {}
): Promise<string[]> => {
  const ignorePattern = options.ignore || [];
  return globby(pattern, {
    absolute: false,
    dot: true,
    unique: true,
    ...options,
    ignore: [...ignorePattern, '**/__MACOSX/**', '**/*.DS_Store'],
  });
};

/**
 * A monorepo (mono repository) is a single repository that stores all of your code and assets for every project.
 * @param cwd normally it always process.cwd()
 */
export const isMonorepo = async (cwd: string = process.cwd()) => {
  const monoPackageCwd = join(cwd, 'packages');
  if (existsSync(monoPackageCwd)) {
    const packageJson = await fileWalk(join(monoPackageCwd, '*/package.json'), {
      cwd,
    });
    return packageJson.length > 0;
  }
  return false;
};
