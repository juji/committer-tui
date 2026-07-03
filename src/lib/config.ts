import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { info, json } from "localog";


export interface Model {
  name: string
  provider: "gemini" | "openai" | "anthropic" | "groq" | "cerebras" | "requesty" | "openrouter" | "ollama" | "ollama-cloud" | "mistral" | "deepseek" | "together" | "fireworks" | "xai" | "perplexity"
  model: string
  apiKey: string
  baseURL?: string
}

export interface Config {
  instructionPrefix: string
  instructionSuffix: string
  theme: string
  models: Model[]
}

export const DEFAULT_INSTRUCTION_PREFIX =
  'Generate a concise conventional commit message from the git diff.\n\nFormat: type(scope): description\n\nBody with bullet points if needed.'


export function getConfigDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), "committer");
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "committer");
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

const PROVIDERS = ["gemini", "openai", "anthropic", "groq", "cerebras", "requesty", "openrouter", "ollama", "ollama-cloud", "mistral", "deepseek", "together", "fireworks", "xai", "perplexity"];

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
    (c.instructionPrefix === undefined || typeof c.instructionPrefix === "string") &&
    (c.instructionSuffix === undefined || typeof c.instructionSuffix === "string") &&
    (c.theme === undefined || typeof c.theme === "string") &&
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

  if (!isValidConfig(parsed)) {
    json(parsed);
    return false;
  }
  return {
    ...parsed,
    instructionPrefix: parsed.instructionPrefix ?? DEFAULT_INSTRUCTION_PREFIX,
    instructionSuffix: parsed.instructionSuffix ?? "",
    theme: parsed.theme ?? "midnight-aurora",
  };
}

export async function writeConfig(config: Config): Promise<void> {
  info(`writeConfig: ${config.models.length} model(s) -> ${getConfigPath()}`);
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getConfigPath(), JSON.stringify(config, null, 2));
}