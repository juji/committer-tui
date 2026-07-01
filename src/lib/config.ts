import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";


export interface Model {
  name: string
  provider: "gemini" | "groq" | "cerebras" | "requesty" | "openrouter" | "ollama"
  model: string
  apiKey: string
  baseURL?: string
}

export interface Config {
  conventional: boolean
  models: Model[]
}


export function getConfigDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), "committer");
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "committer");
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}


export async function readConfig(): Promise<Config | null> {
  try {
    return JSON.parse(await readFile(getConfigPath(), "utf-8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeConfig(config: Config): Promise<void> {
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getConfigPath(), JSON.stringify(config, null, 2));
}