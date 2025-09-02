import type { Options } from 'globby';
import { globby } from 'globby';

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
