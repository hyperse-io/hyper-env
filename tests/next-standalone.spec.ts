import { existsSync } from 'fs';
import { join } from 'path';
import { runTsScript } from '@hyperse/exec-program';
import { getDirname } from '../src/get-dir-name.js';
import { nextStandalone } from '../src/next-standalone.js';

describe('Next Standalone', () => {
  it('should copy only the necessary files for a production deployment including select files in node_modules', async () => {
    const cliPath = getDirname(import.meta.url, './cli.ts');
    const { stderr, stdout } = await runTsScript(cliPath, [
      '--',
      'next',
      'build',
    ]);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/node_env: test/);
    const cwd = process.cwd();
    await nextStandalone(['--fromBase', cwd, '--copyToBase', cwd]);
    expect(
      existsSync(join(cwd, '.next/standalone/node_modules/dotenv/package.json'))
    ).toBe(true);
  });
});
