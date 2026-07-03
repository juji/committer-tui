# Code Review Notes

## Real Bugs

- **`withTimeout` in `provider.ts`** — `AbortController` created but signal never passed to `fn()`. Timeout fires but the request keeps running in background. Fix: pass `controller.signal` or use `AbortSignal.any()`.
- **`getCommitDiff` in `git.ts`** — N+1 git calls (one per file). Use `git show --format= --name-only -p <hash>` in one call.

## Code Smells

- Global mutable ref in render path (`globals.ts` + `Layout`) — violates React conventions
- `useCommitFlowStore` cross-couples to app/config stores via `.getState()` everywhere — god object
- Config auto-saves skip writes when invalid, so in-memory state drifts from disk
- No error boundary — unhandled throw kills the TUI
- `stateRef` pattern repeated in every keyboard-handling component — extract to a hook

## Minor

- `commit/spinner.tsx` is a pure re-export, could be inlined
- Provider URL normalization could miss double-slashes
