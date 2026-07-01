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

const PROVIDERS = ["gemini", "groq", "cerebras", "requesty", "openrouter", "ollama"];

function isValidModel(model: unknown): model is Model {
  if (typeof model !== "object" || model === null) return false;
  const m = model as Record<string, unknown>;
  return (
    typeof m.name === "string" &&
    typeof m.provider === "string" &&
    PROVIDERS.includes(m.provider) &&
    typeof m.model === "string" &&
    typeof m.apiKey === "string" &&
    (m.baseURL === undefined || typeof m.baseURL === "string")
  );
}

export function isValidConfig(config: unknown): config is Config {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.conventional === "boolean" &&
    Array.isArray(c.models) &&
    c.models.length > 0 &&
    c.models.every(isValidModel)
  );
}

export async function readConfig(): Promise<Config | false | null> {
  let raw: string;
  try {
    raw = await readFile(getConfigPath(), "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }

  return isValidConfig(parsed) ? parsed : false;
}

export async function writeConfig(config: Config): Promise<void> {
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getConfigPath(), JSON.stringify(config, null, 2));
}