import type { Model } from './config.js'

export type ModelEntry = { id: string }

export class Provider {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly defaultBaseURL?: string,
    readonly needsBaseURL?: boolean,
    readonly needsApiKey?: boolean,
  ) {}

  async listModels(apiKey: string, baseURL?: string): Promise<ModelEntry[]> {
    const url = baseURL || this.defaultBaseURL
    if (!url) throw new Error(`No base URL for ${this.id}`)
    const res = await fetch(`${url.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.data || []).map((m: any) => ({ id: m.id }))
  }

  async createModel(m: Model) {
    const { createOpenAI } = await import('@ai-sdk/openai')
    return createOpenAI({ apiKey: m.apiKey, baseURL: m.baseURL || this.defaultBaseURL }).chat(m.model)
  }
}

export class GeminiProvider extends Provider {
  constructor() {
    super('gemini', 'Gemini')
  }

  override async listModels(apiKey: string): Promise<ModelEntry[]> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.models || [])
      .filter((m: any) => m.name.startsWith('models/gemini'))
      .map((m: any) => ({ id: m.name.replace('models/', '') }))
  }

  override async createModel(m: Model) {
    const { createGoogle } = await import('@ai-sdk/google')
    return createGoogle({ apiKey: m.apiKey })(m.model)
  }
}

export class OllamaProvider extends Provider {
  constructor() {
    super('ollama', 'Ollama', undefined, true, false)
  }

  override async listModels(baseURL?: string): Promise<ModelEntry[]> {
    const url = (baseURL || 'http://localhost:11434').replace(/\/$/, '')
    const res = await fetch(`${url}/api/tags`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.models || []).map((m: any) => ({ id: m.name }))
  }

  override async createModel(m: Model) {
    const { createOllama } = await import('ollama-ai-provider')
    return createOllama({ baseURL: m.baseURL }).chat(m.model) as any
  }
}

export const BUILTIN_PROVIDERS: Record<string, Provider> = {
  gemini: new GeminiProvider(),
  groq: new Provider('groq', 'Groq', 'https://api.groq.com/openai/v1'),
  cerebras: new Provider('cerebras', 'Cerebras', 'https://api.cerebras.ai/v1'),
  requesty: new Provider('requesty', 'Requesty', 'https://api.requesty.ai/v1'),
  openrouter: new Provider('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1'),
  ollama: new OllamaProvider(),
}
