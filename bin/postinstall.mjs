#!/usr/bin/env node
// ponytail: best-effort binary fetch, bin/committer.mjs falls back to Bun+source if this fails
import { createWriteStream, chmodSync, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const pkg = JSON.parse(
  await import("node:fs").then((fs) => fs.promises.readFile(new URL("../package.json", import.meta.url), "utf8")),
);

const REPO = "juji/committer-tui";
const TARGETS = {
  "darwin-arm64": "committer-darwin-arm64",
  "darwin-x64": "committer-darwin-x64",
  "linux-arm64": "committer-linux-arm64",
  "linux-x64": "committer-linux-x64",
  "win32-x64": "committer-windows-x64.exe",
};

function targetKey() {
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  return `${process.platform}-${arch}`;
}

async function main() {
  if (process.env.COMMITTER_SKIP_BINARY) return;

  const key = targetKey();
  const assetName = TARGETS[key];
  if (!assetName) {
    console.warn(`committer: no prebuilt binary for ${key}, will run from source via Bun`);
    return;
  }

  const url = `https://github.com/${REPO}/releases/download/v${pkg.version}/${assetName}`;
  const binDir = fileURLToPath(new URL(".", import.meta.url));
  const outPath = path.join(binDir, "committer-bin" + (key.startsWith("win32") ? ".exe" : ""));

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    mkdirSync(binDir, { recursive: true });
    await pipeline(res.body, createWriteStream(outPath));
    chmodSync(outPath, 0o755);
    console.log(`committer: installed native binary for ${key}`);
  } catch (err) {
    console.warn(`committer: could not download prebuilt binary (${err.message}), will run from source via Bun`);
  }
}

await main();
