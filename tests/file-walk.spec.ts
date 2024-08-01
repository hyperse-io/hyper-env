import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getDirname } from '../src/get-dir-name.js';
import { fileWalk } from '../src/utils.js';

const createFixtureFiles = (
  url: string,
  dir = 'fixture',
  files: Record<string, string>
) => {
  const fixtureCwd = getDirname(url, dir);
  mkdirSync(fixtureCwd, {
    recursive: true,
  });
  for (const [key, value] of Object.entries(files)) {
    const item = join(fixtureCwd, key);
    mkdirSync(dirname(item), {
      recursive: true,
    });
    writeFileSync(item, value ? value : 'hello' + Math.random());
  }
  return fixtureCwd;
};

describe('fileWalk', () => {
  let fixtureCwd: string;
  const envFiles = {
    '.env': '',
    '.env.dev': '',
    '.env.inte': '',
    '.env.rc': '',
    '.env.prod': '',
  };
  beforeAll(() => {
    fixtureCwd = createFixtureFiles(import.meta.url, 'filewalk', {
      'a/b/c/text.txt': '',
      'a/b/c/image.jpg': '',
      'a/b/c/image.png': '',
      'a/b/c/d/e/image.jpg': '',
      'a/b/c/d/e/image.png': '',
      'a/b/c/style.css': '',
      'a/b/c/.gitignore': '',
      '__MACOSX/test/._demo-8ca86e6b.png': '',
      '__MACOSX/test/demo-8ca86e6b.png': '',
      '__MACOSX/test/assets/__MACOSX/test/._.DS_Store': '',
      'abc/__MACOSX/test/._demo-8ca86e6b.png': '',
      'abc/__MACOSX/test/demo-8ca86e6b.png': '',
      'abc/__MACOSX/test/assets/__MACOSX/test/._.DS_Store': '',
      ...envFiles,
    });
  });

  afterAll(() => {
    rmSync(fixtureCwd, {
      force: true,
      recursive: true,
    });
  });

  describe('fileWalkAsync', () => {
    it('should asynchronously support correct globby patterns & negative patterns', async () => {
      const files = await fileWalk('**/*.*', {
        cwd: fixtureCwd,
        ignore: ['**/*.{jpg,png}'],
      });
      expect(files.length).toBe(8);
      expect(files.filter((s) => s.endsWith('.gitignore')).length).toBe(1);
    });

    it('should asynchronously currect handle dot files', async () => {
      const files = await fileWalk('**/*.*', {
        cwd: fixtureCwd,
      });
      expect(files.length).toBe(12);
      expect(files.filter((s) => s.endsWith('.gitignore')).length).toBe(1);
    });

    it('should asynchronously ignore __MACOSX & .DS_Store', async () => {
      const files = await fileWalk('**/*.*', {
        cwd: fixtureCwd,
      });
      expect(files.length).toBe(12);
      expect(files.filter((s) => s.endsWith('.gitignore')).length).toBe(1);
    });

    it('should asynchronously list .env fules', async () => {
      const files = await fileWalk(['.env', '.env.*'], {
        cwd: fixtureCwd,
      });
      expect(files.length).toBe(5);
      for (const [expectEnvFile] of Object.entries(envFiles)) {
        expect(files.find((s) => s.endsWith(expectEnvFile))).toBeDefined();
      }
    });
  });
});
