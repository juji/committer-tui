import os from "node:os";

export interface ChangedFile {
  path: string;
  status: string;
}

export function displayPath(cwd: string): string {
  if (process.platform === "win32") return cwd;
  const home = os.homedir();
  return cwd === home || cwd.startsWith(home + "/") ? `~${cwd.slice(home.length)}` : cwd;
}

// `git status --porcelain` reports paths relative to the repo root, not the
// current working directory. Running every git command from the repo root
// keeps those paths valid — otherwise diff/add for a path like "src/foo.ts"
// resolves against the cwd instead (e.g. "src/lib/src/foo.ts" when run from
// src/lib), and git silently reports no changes.
let repoRootPromise: Promise<string> | null = null;
export function getRepoRoot(): Promise<string> {
  if (!repoRootPromise) {
    repoRootPromise = (async () => {
      const proc = Bun.spawn(["git", "rev-parse", "--show-toplevel"], { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" });
      const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
      if (exitCode !== 0) throw new Error("not a git repository");
      return stdout.trim();
    })();
  }
  return repoRootPromise;
}

async function spawnGit(args: string[]) {
  try {
    const cwd = await getRepoRoot();
    return Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  } catch (err) {
    if (err instanceof Error && err.message === "not a git repository") throw err;
    throw new Error("git not found — is it installed and in PATH?");
  }
}

async function runGit(args: string[], allowedExitCodes: number[] = [0]): Promise<string> {
  const proc = await spawnGit(args);
  const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  if (!allowedExitCodes.includes(exitCode)) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(stderr || `git ${args.join(" ")} failed`);
  }
  return stdout;
}

export async function runGitStreaming(args: string[], onLine: (line: string) => void): Promise<void> {
  const proc = await spawnGit(args);

  const readLines = async (stream: ReadableStream<Uint8Array>) => {
    for await (const chunk of stream) {
      const text = new TextDecoder().decode(chunk);
      for (const line of text.split("\n")) {
        if (line) onLine(line);
      }
    }
  };

  await Promise.all([readLines(proc.stdout), readLines(proc.stderr)]);
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed with exit code ${exitCode}`);
  }
}

// Stage one path at a time, not `git add -- ...paths` in one call: the file list can go stale
// between when the commit flow snapshots `git status` and when the user confirms (e.g. a path
// gets deleted/untracked in between). A single bad pathspec fails the whole batched `add` with
// exit 128 and aborts the entire commit. Per-path calls let one bad file get skipped (reported
// via onLine) while the rest still stage and the commit proceeds.
export async function addPaths(paths: string[], onLine: (line: string) => void): Promise<void> {
  for (const path of paths) {
    try {
      await runGitStreaming(["add", "--", path], onLine);
    } catch (err) {
      onLine(`skipped ${path}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
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

export interface CommitLogEntry {
  hash: string;
  date: string;
  message: string;
}

const RECORD_SEP = "\x1e";
const FIELD_SEP = "\x1f";

export async function getCommitLog(limit = 50, skip = 0): Promise<CommitLogEntry[]> {
  const output = await runGit(
    [
      "log",
      `--max-count=${limit}`,
      `--skip=${skip}`,
      `--pretty=format:%H${FIELD_SEP}%aI${FIELD_SEP}%B${RECORD_SEP}`,
    ],
    [0, 128], // exit 128 when there are no commits yet
  );
  return output
    .split(RECORD_SEP)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, date, ...rest] = record.split(FIELD_SEP);
      return { hash: hash ?? "", date: date ?? "", message: rest.join(FIELD_SEP).trim() };
    });
}

export async function getCurrentBranch(): Promise<string> {
  try {
    return (await runGit(["rev-parse", "--abbrev-ref", "HEAD"])).trim();
  } catch {
    return "unknown";
  }
}

export async function getCommitDiff(hash: string): Promise<FileDiff[]> {
  const output = await runGit(["show", "--format=", "-p", hash]);
  const sections = output.split(/^diff --git /m).filter((s) => s.trim().length > 0);

  const results: FileDiff[] = [];
  for (const section of sections) {
    const headerMatch = section.match(/--- a\/(.+)\n\+\+\+ b\/(.+)\n/);
    if (!headerMatch?.[2]) continue;
    const path = headerMatch[2];
    const diff = "diff --git " + section;
    if (diff) results.push({ path, diff });
  }
  return results;
}

export async function getDiffs(paths: string[]): Promise<FileDiff[]> {
  if (paths.length === 0) return [];

  const files = await getChangedFiles();
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
