# Plan: TUI Git Committer

A terminal UI (OpenTUI + React + zustand) for staging, reviewing, and
committing changes in this repo, replacing `git add -p` / `git commit` with
an interactive screen.

## Scope (confirmed)

- Status/log view — staged/unstaged files + recent commit history
- Interactive staging — browse files, view diffs, stage/unstage
- Commit message editor — subject + body, then commit
- AI-generated commit message — drafted from staged diff, edited before
  commit. **Deferred**: no provider wired yet, ships as a stub action
  (`generateMessage()` that's a no-op/TODO) so the UI and keybinding exist
  but no SDK/API key is required to start.
- Real git integration via shelling out to the `git` CLI (no library dep —
  `git` is already a guaranteed dependency of a git repo).

## Architecture

- `src/git.ts` — thin wrappers around `git` CLI calls using Bun's `$` shell
  (`Bun.$`): `status()`, `diff(file?)`, `stage(file)`, `unstage(file)`,
  `commit(message)`, `log(n)`. Parses `git status --porcelain=v1` output.
- `src/store.ts` — zustand store holding: file list (staged/unstaged),
  selected file, current diff text, commit message draft, recent log
  entries, view/focus state. Actions call into `src/git.ts` and refresh
  state from git after each mutation (no optimistic diffing — git is the
  source of truth).
- `src/index.tsx` — layout: left pane = file list (staged/unstaged
  sections), right pane = diff viewer for selected file, bottom pane =
  commit message input + recent log. Keybindings: arrows/j-k to navigate,
  space/enter to stage/unstage selected file, `c` to focus commit message,
  `enter` in message box to commit, `g` to call `generateMessage()` stub.

No `src/components/` split yet — one screen, one file. Split out if the
layout grows past this.

## Out of scope for v1 (add later if needed)

- Hunk-level (partial file) staging — v1 stages whole files only
- Diff syntax highlighting
- Branch switching / push / pull
- Wiring an actual AI provider — revisit once a provider is chosen

## Steps

1. `src/git.ts` — git CLI wrappers + porcelain status parser
2. `src/store.ts` — zustand store wired to `git.ts`
3. `src/index.tsx` — three-pane layout, keyboard navigation, staging,
   commit flow
4. Manual verification: stage/unstage real files in this repo, commit, undo
   via `git reset` if needed

---

# API Key Validation on Splash Screen

## Requirements

When the app starts, validate API keys before entering the main screen.

## Cases

### No config file
- Open config popup automatically
- Proceed to app screen

### All API keys failed validation
- Open config popup automatically
- Proceed to app screen

### Some API keys failed (partial)
- Show splash screen with:
  - Message indicating which providers failed
  - [Config] button - opens config popup
  - [Ignore] button - continues to app without fixing

### All API keys valid
- Proceed directly to app screen

## Implementation

### Provider.checkApiKey()
- Default implementation: calls `listModels()` to validate
- Timeout: 30 seconds per provider
- Requesty special case: uses `generateText()` with "hi" prompt since Requesty returns HTTP 200 even with invalid keys

### State Management
- `apiValidationStatus`: "idle" | "validating" | "valid" | "partial" | "failed"
- `invalidProviders`: array of provider IDs that failed validation

### Modified Files
- `src/lib/provider.ts` — Added `checkApiKey()` method and `RequestyProvider` class
- `src/store/app-store.ts` — Added validation state and `checkApiKeys()` method
