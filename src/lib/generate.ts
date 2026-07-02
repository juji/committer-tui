import { generateText } from 'ai'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

const START_RE = /`{3}commit-message/
const END_RE = /`{3}/

export const FENCE_INSTRUCTIONS =
  'Wrap the commit message, and only the commit message, in a fenced block like this:\n\n```commit-message\nthe message\n```\n\nDo not include any other commentary, explanation, or preamble outside that block.'

export async function generateCommitMessage(diff: string, model: Model, instructionPrefix: string, instructionSuffix: string): Promise<string> {
  const p = BUILTIN_PROVIDERS[model.provider]
  if (!p) throw new Error(`Unknown provider: ${model.provider}`)

  const system = [instructionPrefix, FENCE_INSTRUCTIONS, instructionSuffix].filter(Boolean).join('\n\n')

  const { text } = await generateText({
    model: await p.createModel(model),
    system,
    prompt: `Git diff:\n\n${diff}`,
  })

  const startMatch = text.match(START_RE)
  if (!startMatch) {
    throw new Error(`Model did not return a commit message in the expected format. Raw output: ${text}`)
  }
  const contentStart = startMatch.index! + startMatch[0].length
  const endMatch = text.slice(contentStart).match(END_RE)
  if (!endMatch) {
    throw new Error(`Model did not return a commit message in the expected format. Raw output: ${text}`)
  }

  return text.slice(contentStart, contentStart + endMatch.index!).trim()
}
