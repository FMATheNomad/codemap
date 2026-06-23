import * as path from 'path';
import * as cp from 'child_process';

interface TestOptions {
  extensionDevelopmentPath: string;
  extensionTestsPath: string;
  launchArgs?: string[];
}

function runTests(options: TestOptions): Promise<string> {
  const args: string[] = [
    '--extensionDevelopmentPath', options.extensionDevelopmentPath,
    '--extensionTestsPath', options.extensionTestsPath,
  ];

  if (options.launchArgs) {
    args.push(...options.launchArgs);
  }

  return new Promise((resolve, reject) => {
    const executable = process.platform === 'win32'
      ? 'code.cmd'
      : 'code';

    const child = cp.spawn(executable, args, {
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve('Tests completed successfully');
      } else {
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const testWorkspacePath = path.resolve(__dirname, '../test/fixtures');

    const result = await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [testWorkspacePath],
    });

    console.log(result);
    process.exit(0);
  } catch (err) {
    console.error('Test run failed:', err);
    process.exit(1);
  }
}

main();
