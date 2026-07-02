#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const binDir = fileURLToPath(new URL(".", import.meta.url));
const nativeBinary = path.join(binDir, "committer-bin" + (process.platform === "win32" ? ".exe" : ""));

const result = existsSync(nativeBinary)
  ? spawnSync(nativeBinary, process.argv.slice(2), { stdio: "inherit" })
  : spawnSync("bun", [path.join(binDir, "..", "src", "index.tsx"), ...process.argv.slice(2)], { stdio: "inherit" });

if (result.error) {
  console.error(
    result.error.code === "ENOENT"
      ? "committer: no prebuilt binary found and Bun is not installed. Install Bun: https://bun.sh"
      : result.error.message,
  );
  process.exit(1);
}
process.exit(result.status ?? 1);
