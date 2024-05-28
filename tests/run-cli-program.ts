import { join } from 'path';
import { type CliMockResult, runTsScript } from '@armit/commander';

export async function runTsCliMock(
  program: string,
  ...args: string[]
): Promise<CliMockResult> {
  try {
    const tsconfig = join(process.cwd(), './tsconfig.json');
    const result = await runTsScript(program, 'esm', tsconfig, {}, ...args);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  } catch (err) {
    return err as CliMockResult;
  }
}
