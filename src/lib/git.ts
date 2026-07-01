export interface ChangedFile {
  path: string;
  status: string;
}

async function runGit(args: string[], allowedExitCodes: number[] = [0]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" });
  const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  if (!allowedExitCodes.includes(exitCode)) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(stderr || `git ${args.join(" ")} failed`);
  }
  return stdout;
}

export async function getChangedFiles(): Promise<ChangedFile[]> {
  const output = await runGit(["status", "--porcelain", "-uall"]);
  return output
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => ({ status: line.slice(0, 2).trim(), path: line.slice(3) }));
}

export interface FileDiff {
  path: string;
  diff: string;
}

export async function getDiffs(paths: string[]): Promise<FileDiff[]> {
  if (paths.length === 0) return [];

  const files = await getChangedFiles();
  const included = new Set(paths);
  const statusByPath = new Map(files.map((f) => [f.path, f.status]));

  const results: FileDiff[] = [];
  for (const path of paths) {
    const status = statusByPath.get(path);
    const diff =
      status === "??"
        ? // git diff --no-index exits 1 when files differ, which is the expected case here
          await runGit(["diff", "--no-index", "--", "/dev/null", path], [0, 1])
        : await runGit(["diff", "HEAD", "--", path]);
    if (diff) results.push({ path, diff });
  }
  return results;
}
