import * as vscode from 'vscode';

export async function withProgress<T>(
  title: string,
  task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
): Promise<T> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false,
    },
    task
  );
}

export function createProgressReporter(
  progress: vscode.Progress<{ message?: string; increment?: number }>,
  total: number
) {
  let current = 0;

  return {
    report(message: string, increment: number = 1) {
      current += increment;
      const pct = Math.min(Math.round((current / total) * 100), 100);
      progress.report({ message: `${message} (${pct}%)`, increment });
    },
    done() {
      progress.report({ message: 'Done', increment: 0 });
    },
  };
}
