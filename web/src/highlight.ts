import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/langs/bash.mjs'
import githubDark from 'shiki/themes/github-dark.mjs'

const highlighterPromise = createHighlighterCore({
  themes: [githubDark],
  langs: [bash],
  engine: createJavaScriptRegexEngine(),
})

export async function renderCodeBlocks() {
  const highlighter = await highlighterPromise
  const blocks = document.querySelectorAll<HTMLElement>('[data-shiki]')
  for (const block of blocks) {
    const code = block.textContent?.trim() ?? ''
    const html = highlighter.codeToHtml(code, { lang: 'bash', theme: 'github-dark' })
    block.outerHTML = html
  }

  document.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach((btn) => {
    const code = btn.closest('.code-block')?.querySelector('.shiki')?.textContent ?? ''
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(code.trim())
      btn.textContent = 'Copied!'
      setTimeout(() => (btn.textContent = 'Copy'), 1500)
    })
  })
}
