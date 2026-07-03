#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const binDir = fileURLToPath(new URL(".", import.meta.url));
const nativeBinary = path.join(binDir, "committer-bin" + (process.platform === "win32" ? ".exe" : ""));

if (!existsSync(nativeBinary)) {
  console.error(
    `committer: no prebuilt binary for ${process.platform}-${process.arch}. ` +
      "Supported platforms: darwin/linux (x64, arm64), windows (x64).",
  );
  process.exit(1);
}

const result = spawnSync(nativeBinary, process.argv.slice(2), { stdio: "inherit" });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
