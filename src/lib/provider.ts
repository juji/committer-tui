import type { Model } from './config.js'
import { info, error } from 'localog'

export type ModelEntry = { id: string }

const CHECK_TIMEOUT_MS = 30000

async function withTimeout<T>(fn: (signal?: AbortSignal) => Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fn(controller.signal)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(errorMessage)
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export class Provider {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly defaultBaseURL?: string,
    readonly needsBaseURL?: boolean,
    readonly needsApiKey?: boolean,
  ) {}

  async listModels(apiKey: string, baseURL?: string, signal?: AbortSignal): Promise<ModelEntry[]> {
    const url = baseURL || this.defaultBaseURL
    if (!url) throw new Error(`No base URL for ${this.id}`)
    const res = await fetch(`${url.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.data || []).map((m: any) => ({ id: m.id }))
  }

  async checkApiKey(m: Model): Promise<boolean> {
    const providerName = this.id;
    try {
      info(`checkApiKey ${providerName}: calling listModels`)
      await withTimeout((signal) => this.listModels(m.apiKey, m.baseURL, signal), CHECK_TIMEOUT_MS, 'API key check timed out')
      info(`checkApiKey ${providerName}: success`)
      return true
    } catch (e) {
      error(`checkApiKey ${providerName}: failed - ${e}`)
      return false
    }
  }

  async createModel(m: Model) {
    const { createOpenAI } = await import('@ai-sdk/openai')
    return createOpenAI({ apiKey: m.apiKey, baseURL: m.baseURL || this.defaultBaseURL }).chat(m.model)
  }
}

export class RequestyProvider extends Provider {
  constructor() {
    super('requesty', 'Requesty', 'https://router.requesty.ai/v1')
  }

  override async checkApiKey(m: Model): Promise<boolean> {
    try {
      const result = await withTimeout(
        async () => {
          const { generateText } = await import('ai')
          const { createOpenAI } = await import('@ai-sdk/openai')
          const model = createOpenAI({ apiKey: m.apiKey, baseURL: m.baseURL || this.defaultBaseURL }).chat(m.model)
          const { text } = await generateText({ model, prompt: 'hi' })
          return text.length > 0
        },
        CHECK_TIMEOUT_MS,
        'API key check timed out',
      )
      return result
    } catch {
      return false
    }
  }

  override async createModel(m: Model) {
    const { createOpenAI } = await import('@ai-sdk/openai')
    return createOpenAI({ apiKey: m.apiKey, baseURL: m.baseURL || this.defaultBaseURL }).chat(m.model)
  }
}

export class GeminiProvider extends Provider {
  constructor() {
    super('gemini', 'Gemini')
  }

  override async listModels(apiKey: string, _baseURL?: string, signal?: AbortSignal): Promise<ModelEntry[]> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal })
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

  override async listModels(_apiKey?: string, baseURL?: string, signal?: AbortSignal): Promise<ModelEntry[]> {
    const url = (baseURL || 'http://localhost:11434').replace(/\/$/, '')
    const res = await fetch(`${url}/api/tags`, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.models || []).map((m: any) => ({ id: m.name }))
  }

  override async createModel(m: Model) {
    const { createOllama } = await import('ollama-ai-provider')
    return createOllama({ baseURL: m.baseURL }).chat(m.model) as any
  }
}

export class OllamaCloudProvider extends Provider {
  constructor() {
    super('ollama-cloud', 'Ollama Cloud', 'https://ollama.com', false, true)
  }

  override async listModels(apiKey: string, baseURL?: string, signal?: AbortSignal): Promise<ModelEntry[]> {
    const url = (baseURL || this.defaultBaseURL)!.replace(/\/$/, '')
    const res = await fetch(`${url}/api/tags`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.models || []).map((m: any) => ({ id: m.name }))
  }

  override async createModel(m: Model) {
    const { createOllama } = await import('ollama-ai-provider')
    return createOllama({ baseURL: `${(m.baseURL || this.defaultBaseURL)!.replace(/\/$/, '')}/v1`, headers: { Authorization: `Bearer ${m.apiKey}` } }).chat(m.model) as any
  }
}

export class AnthropicProvider extends Provider {
  constructor() {
    super('anthropic', 'Anthropic', 'https://api.anthropic.com/v1')
  }

  override async listModels(apiKey: string, baseURL?: string, signal?: AbortSignal): Promise<ModelEntry[]> {
    const url = (baseURL || this.defaultBaseURL)!.replace(/\/$/, '')
    const res = await fetch(`${url}/models`, {
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body: any = await res.json()
    return (body.data || []).map((m: any) => ({ id: m.id }))
  }

  override async createModel(m: Model) {
    const { createAnthropic } = await import('@ai-sdk/anthropic')
    return createAnthropic({ apiKey: m.apiKey, baseURL: m.baseURL || this.defaultBaseURL })(m.model)
  }
}

export const BUILTIN_PROVIDERS: Record<string, Provider> = {
  gemini: new GeminiProvider(),
  openai: new Provider('openai', 'OpenAI', 'https://api.openai.com/v1'),
  anthropic: new AnthropicProvider(),
  groq: new Provider('groq', 'Groq', 'https://api.groq.com/openai/v1'),
  cerebras: new Provider('cerebras', 'Cerebras', 'https://api.cerebras.ai/v1'),
  requesty: new RequestyProvider(),
  openrouter: new Provider('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1'),
  ollama: new OllamaProvider(),
  'ollama-cloud': new OllamaCloudProvider(),
  mistral: new Provider('mistral', 'Mistral', 'https://api.mistral.ai/v1'),
  deepseek: new Provider('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1'),
  together: new Provider('together', 'Together AI', 'https://api.together.xyz/v1'),
  fireworks: new Provider('fireworks', 'Fireworks AI', 'https://api.fireworks.ai/inference/v1'),
  xai: new Provider('xai', 'xAI', 'https://api.x.ai/v1'),
  perplexity: new Provider('perplexity', 'Perplexity', 'https://api.perplexity.ai'),
}
