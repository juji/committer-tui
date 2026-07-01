import { generateText } from 'ai'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

const DELIMITER_START = '<<<COMMIT_MESSAGE>>>'
const DELIMITER_END = '<<<END_COMMIT_MESSAGE>>>'

export async function generateCommitMessage(diff: string, model: Model, conventional: boolean): Promise<string> {
  const p = BUILTIN_PROVIDERS[model.provider]
  if (!p) throw new Error(`Unknown provider: ${model.provider}`)

  const formatInstructions = conventional
    ? 'Generate a concise conventional commit message from the git diff.\n\nFormat: type(scope): description\n\nBody with bullet points if needed.'
    : 'Generate a concise commit message from the git diff.'

  const { text } = await generateText({
    model: await p.createModel(model),
    system: `${formatInstructions}\n\nWrap the commit message, and only the commit message, between ${DELIMITER_START} and ${DELIMITER_END}. Do not include any other commentary, explanation, or preamble outside those markers.`,
    prompt: `Git diff:\n\n${diff}`,
  })

  const start = text.indexOf(DELIMITER_START)
  const end = text.indexOf(DELIMITER_END)
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return a commit message in the expected format.')
  }

  return text.slice(start + DELIMITER_START.length, end).trim()
}
