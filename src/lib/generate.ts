import { generateText } from 'ai'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

export async function generateCommitMessage(diff: string, model: Model, conventional: boolean): Promise<string> {
  const p = BUILTIN_PROVIDERS[model.provider]
  if (!p) throw new Error(`Unknown provider: ${model.provider}`)
  const { text } = await generateText({
    model: await p.createModel(model),
    system: conventional
      ? 'Generate a concise conventional commit message from the git diff.\n\nFormat: type(scope): description\n\nBody with bullet points if needed.'
      : 'Generate a concise commit message from the git diff.',
    prompt: `Git diff:\n\n${diff}`,
  })
  return text
}
