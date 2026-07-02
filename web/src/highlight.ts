import { codeToHtml } from 'shiki'

export async function renderCodeBlocks() {
  const blocks = document.querySelectorAll<HTMLElement>('[data-shiki]')
  for (const block of blocks) {
    const lang = block.dataset.shiki || 'bash'
    const code = block.textContent?.trim() ?? ''
    const html = await codeToHtml(code, { lang, theme: 'github-dark' })
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
