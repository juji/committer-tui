import { generateText } from 'ai'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

const START_RE = /`{3}commit-message/
const END_RE = /`{3}/

export async function generateCommitMessage(diff: string, model: Model, conventional: boolean): Promise<string> {
  const p = BUILTIN_PROVIDERS[model.provider]
  if (!p) throw new Error(`Unknown provider: ${model.provider}`)

  const formatInstructions = conventional
    ? 'Generate a concise conventional commit message from the git diff.\n\nFormat: type(scope): description\n\nBody with bullet points if needed.'
    : 'Generate a concise commit message from the git diff.'

  const { text } = await generateText({
    model: await p.createModel(model),
    system: `${formatInstructions}\n\nWrap the commit message, and only the commit message, in a fenced block like this:\n\n\`\`\`\`\`commit-message\nthe message\n\`\`\`\`\`\n\nDo not include any other commentary, explanation, or preamble outside that block.`,
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
