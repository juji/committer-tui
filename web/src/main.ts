import './style.css'
import heroShot from './assets/hero-screenshot.png'
import { renderCodeBlocks } from './highlight'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header id="site-header">
  <span class="logo">committer<span class="cursor">_</span></span>
  <a id="header-github" href="https://github.com/juji/committer-tui" target="_blank" rel="noopener" aria-label="GitHub">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>
  </a>
</header>

<section id="center">
  <h1>Stop staring at a blank commit message.</h1>
  <p class="tagline">
    committer looks at your staged diff, drafts a proper conventional
    commit, and hands it to you to tweak. Then it commits. All from your
    keyboard.
  </p>
  <img class="screenshot" src="${heroShot}" alt="committer TUI showing a staged diff, an AI-drafted commit message, and commit history" />
</section>

<div class="ticks"></div>

<section id="pitch">
  <h2>Yes, VS Code already does this.</h2>
  <p>
    We know. Some editors have this built in already. We just really wanted
    to build something with <a href="https://opentui.com" target="_blank">OpenTUI</a>,
    and "AI writes your commit message in the terminal" seemed like a fun
    excuse. So here we are.
  </p>
</section>

<div class="ticks"></div>

<section id="features">
  <div>
    <h2>Bring your own model</h2>
    <p>OpenAI, Anthropic, Gemini, Groq, Cerebras, Mistral, DeepSeek, Together AI, Fireworks, xAI, Perplexity, Requesty, OpenRouter, Ollama Cloud, or a local Ollama — plug in whichever you already have keys for.</p>
  </div>
  <div>
    <h2>Nothing leaves your machine</h2>
    <p>Your diff goes straight to the provider you picked. No middleman server, nothing logged, nothing else phoned home.</p>
  </div>
  <div>
    <h2>Keyboard-first</h2>
    <p>Stage, review, edit, commit, browse history — <code>ctrl+g</code> for config, <code>ctrl+y</code> for history.</p>
  </div>
  <div>
    <h2>Mouse enabled</h2>
    <p>Prefer clicking? Buttons respond to the mouse too. Use whichever hand feels right.</p>
  </div>
</section>

<div class="ticks"></div>

<section id="install">
  <h2>Install</h2>
  <p>Prebuilt binary, no Bun required:</p>
  <div class="code-block">
    <div class="code-block-bar"><button class="copy-btn" type="button">Copy</button></div>
    <pre data-shiki="bash">curl -fsSL https://raw.githubusercontent.com/juji/committer-tui/main/install.sh | bash</pre>
  </div>
  <p>Or via npm:</p>
  <div class="code-block">
    <div class="code-block-bar"><button class="copy-btn" type="button">Copy</button></div>
    <pre data-shiki="bash">npm install -g committer-tui</pre>
  </div>
  <p>Or build it yourself (requires <a href="https://bun.sh" target="_blank">Bun</a>):</p>
  <div class="code-block">
    <div class="code-block-bar"><button class="copy-btn" type="button">Copy</button></div>
    <pre data-shiki="bash">git clone git@github.com:juji/committer-tui.git
cd committer-tui
bun install
bun build --compile src/index.tsx --outfile committer-bin
ln -s "$(pwd)/committer-bin" /usr/local/bin/committer</pre>
  </div>
  <ul class="platforms">
    <li>macOS</li>
    <li>Linux</li>
    <li>Windows (Git Bash / MSYS2 / Cygwin)</li>
    <li>x64 &amp; arm64</li>
  </ul>
  <h2 class="get-it-running">Get it running</h2>
  <p class="tui-intro">Run <code>committer</code> to start with config, and run the TUI.</p>
  <p>Prefer plain prompts in the terminal over a full-screen UI? <code>committer -c</code> runs the same commit cycle without the TUI.</p>
  <img class="cli-screenshot" src="/cli.png" alt="committer -c running in the terminal with plain prompts" />
  <p class="help-preview-intro">Run <code>committer -h</code> or <code>committer --help</code> to view help content:</p>
  <pre class="help-preview">committer v0.8.15 — AI-powered commit messages for git

USAGE
  committer                 Start the TUI
  committer -c              Run the commit cycle in the terminal (no TUI)
  committer --help, -h      Show this message
  committer --version, -v   Show the installed version

KEYBOARD
  ctrl+c       Exit
  ctrl+g       Open config
  ctrl+y       Toggle history sidebar
  tab          Cycle focus between areas
  enter        Activate focused button
  esc          Go back / close panel

CONFIG
  ~/.config/committer/config.json

All providers, instructions, and theme are configured
from within the TUI.</pre>
</section>

<div class="ticks"></div>

<footer id="footer">
  <a href="https://github.com/juji/committer-tui" target="_blank" rel="noopener">GitHub</a>
  <span>MIT licensed</span>
  <a href="https://jujiyangasli.com" target="_blank" rel="noopener">jujiyangasli.com</a>
</footer>
`

renderCodeBlocks()
