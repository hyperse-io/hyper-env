import { existsSync } from 'fs';
import { join } from 'path';
import { nextStandalone } from '../src/next-standalone.js';

describe('Next Standalone', () => {
  it('should copy only the necessary files for a production deployment including select files in node_modules', async () => {
    const cwd = process.cwd();
    await nextStandalone(['--fromBase', cwd, '--copyToBase', cwd]);
    expect(
      existsSync(join(cwd, '.next/standalone/node_modules/dotenv/package.json'))
    ).toBe(true);
  });
});
