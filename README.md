# committer

A terminal UI for writing git commit messages with AI. Reviews your staged
diff, generates a conventional commit message, lets you edit it, and commits
— all from the keyboard.

## Install

### Option 1: installer (prebuilt binary)

Downloads the latest release binary for your platform (macOS, Linux, or
Windows via Git Bash/MSYS2/Cygwin) to `~/.local/bin`:

```bash
curl -fsSL https://raw.githubusercontent.com/juji/committer-tui/main/install.sh | bash
```

Supports x64 and arm64. Without a bash shell on Windows, download the
matching `.exe` from the [latest release](https://github.com/juji/committer-tui/releases/latest)
directly.

### Option 2: build from source

Requires [Bun](https://bun.sh).

```bash
git clone git@github.com:juji/committer-tui.git
cd committer-tui
bun install
ln -s "$(pwd)/bin/committer.mjs" /usr/local/bin/committer
```

## Usage

From inside a git repo with staged changes:

```bash
committer
```

Or during development, without linking:

```bash
bun dev
```

### Shortcuts

| Key      | Action        |
| -------- | ------------- |
| `ctrl+g` | Open config   |
| `ctrl+y` | View history  |
| `ctrl+c` | Exit          |

## Configuration

Press `ctrl+g` inside the app to add a model, or edit the config file
directly at:

- Linux/macOS: `~/.config/committer/config.json`
- Windows: `%APPDATA%/committer/config.json`

Each model needs a provider, model name, and API key:

```json
{
  "models": [
    { "name": "My Model", "provider": "gemini", "model": "gemini-2.0-flash", "apiKey": "..." }
  ]
}
```

Supported providers: `gemini`, `groq`, `cerebras`, `requesty`, `openrouter`,
`ollama`. `ollama` runs against a local server (defaults to
`http://localhost:11434`) and doesn't need an API key.

You can also override the instructions sent to the model with
`instructionPrefix` / `instructionSuffix`, either from the config screen or
directly in the JSON file.

### Privacy

API keys are stored only in your local `config.json` and sent only to the
provider you configured for that model, directly from your machine — never
to any server we run. Your diff is sent only to the model provider you pick,
solely to generate the commit message; nothing is logged or transmitted
anywhere else.

## Releasing

Pushing a `v*` tag triggers CI to cross-compile binaries for macOS, Linux,
and Windows and attach them to a GitHub Release:

```bash
git tag v0.1.0
git push --tags
```

For a pre-release (beta, rc, etc.), use a tag with a hyphen suffix — CI
marks it as a GitHub pre-release automatically, so `install.sh` (which
downloads from `releases/latest`) skips it until you promote a stable tag:

```bash
git tag v0.2.0-beta.1
git push --tags
```

## Development

```bash
bun dev          # run with file watching
bun dev:rmconf   # wipe local config
```
