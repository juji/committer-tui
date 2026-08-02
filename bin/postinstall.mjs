#!/usr/bin/env node
// ponytail: best-effort binary fetch; bin/committer.mjs errors clearly if this fails
import { createHash } from "node:crypto";
import { createWriteStream, chmodSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const GREEN = "\x1b[0;32m";
const RED = "\x1b[0;31m";
const NC = "\x1b[0m";

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
    console.warn(`committer: no prebuilt binary for ${key}`);
    return;
  }

  const releaseBase = `https://github.com/${REPO}/releases/download/v${pkg.version}`;
  const url = `${releaseBase}/${assetName}`;
  const shaUrl = `${url}.sha256`;
  const binDir = fileURLToPath(new URL(".", import.meta.url));
  const outPath = path.join(binDir, "committer-bin" + (key.startsWith("win32") ? ".exe" : ""));

  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    mkdirSync(binDir, { recursive: true });
    await pipeline(res.body, createWriteStream(outPath));

    console.log("committer: verifying checksum...");
    const shaRes = await fetch(shaUrl, { redirect: "follow" });
    if (!shaRes.ok) throw new Error(`HTTP ${shaRes.status} fetching checksum`);
    const expectedSha = (await shaRes.text()).trim().split(/\s+/)[0];
    const actualSha = createHash("sha256").update(readFileSync(outPath)).digest("hex");
    if (actualSha !== expectedSha) {
      unlinkSync(outPath);
      throw new Error(`checksum mismatch (expected ${expectedSha}, got ${actualSha})`);
    }
    console.log(`committer: ${GREEN}✓ checksum verified${NC}`);

    chmodSync(outPath, 0o755);
    console.log(`committer: installed native binary for ${key}`);

    // Verify the installed binary reports the version we just downloaded.
    // Retries with a short wait since first execution of a freshly-written
    // binary can race the OS's own executable validation and fail transiently.
    let verified = false;
    let actualVersion = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`committer: checking installed binary (attempt ${attempt})...`);
      const result = spawnSync(outPath, ["--version"], { encoding: "utf8" });
      actualVersion = (result.stdout || "").trim();
      if (actualVersion === pkg.version) {
        verified = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (verified) {
      console.log(`committer: ${GREEN}✓ verified ${outPath} is version ${pkg.version}${NC}`);
    } else {
      console.warn(`committer: ${RED}✗ could not verify ${outPath} reports version ${pkg.version} (got: '${actualVersion}')${NC}`);
    }
  } catch (err) {
    console.warn(`committer: could not download prebuilt binary (${err.message})`);
  }
}

await main();
