import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

const commitMessageSchema = z.object({
  message: z.string().describe('The commit message'),
})

export async function generateCommitMessage(diff: string, model: Model, conventional: boolean): Promise<string> {
  const p = BUILTIN_PROVIDERS[model.provider]
  if (!p) throw new Error(`Unknown provider: ${model.provider}`)
  const { output } = await generateText({
    model: await p.createModel(model),
    output: Output.object({ schema: commitMessageSchema }),
    system: conventional
      ? 'Generate a concise conventional commit message from the git diff.\n\nFormat: type(scope): description\n\nBody with bullet points if needed.'
      : 'Generate a concise commit message from the git diff.',
    prompt: `Git diff:\n\n${diff}`,
  })
  return output.message.trim()
}
