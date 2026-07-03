export interface ChangedFile {
  path: string;
  status: string;
}

function spawnGit(args: string[]) {
  try {
    return Bun.spawn(["git", ...args], { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" });
  } catch {
    throw new Error("git not found — is it installed and in PATH?");
  }
}

async function runGit(args: string[], allowedExitCodes: number[] = [0]): Promise<string> {
  const proc = spawnGit(args);
  const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  if (!allowedExitCodes.includes(exitCode)) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(stderr || `git ${args.join(" ")} failed`);
  }
  return stdout;
}

export async function runGitStreaming(args: string[], onLine: (line: string) => void): Promise<void> {
  const proc = spawnGit(args);

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
