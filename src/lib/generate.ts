import { generateText } from 'ai'
import type { Model } from './config.js'
import { BUILTIN_PROVIDERS } from './provider.js'

const DELIMITER_START = '<<<COMMIT_MESSAGE>>>'
const DELIMITER_END = '<<<END_COMMIT_MESSAGE>>>'
const START_RE = /<{2,}COMMIT_MESSAGE>{2,}/
const END_RE = /<{2,}END_COMMIT_MESSAGE>{2,}/

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

  const startMatch = text.match(START_RE)
  const endMatch = text.match(END_RE)
  if (!startMatch || !endMatch || endMatch.index! <= startMatch.index!) {
    throw new Error(`Model did not return a commit message in the expected format. Raw output: ${text}`)
  }

  return text.slice(startMatch.index! + startMatch[0].length, endMatch.index!).trim()
}
