#!/usr/bin/env bun
import type { KeyEvent } from "@opentui/core";
import { createCliRenderer } from "@opentui/core";
import { useAppContext, createRoot } from "@opentui/react";
import os from "node:os";
import { useEffect } from "react";
import packageJson from "../package.json";
import { AppScreen } from "./components/app";
import { ErrorBoundary } from "./components/error-boundary";
import { Layout } from "./components/layout";
import { Splash } from "./components/splash";
import { useGlobalShortcuts } from "./lib/shortcuts";
import { useAppStore } from "./store/app-store";
import { useKeyboardStore } from "./store/keyboard-store";

function App() {
  const screen = useAppStore((s) => s.screen);
  useGlobalShortcuts();

  const { keyHandler } = useAppContext();
  useEffect(() => {
    const onKey = (key: KeyEvent) => useKeyboardStore.getState().dispatch(key);
    keyHandler?.on("keypress", onKey);
    return () => {
      keyHandler?.off("keypress", onKey);
    };
  }, [keyHandler]);

  return (
    <ErrorBoundary>
      <Layout>
        {screen === "splash" && <Splash />}
        {screen === "app" && <AppScreen />}
      </Layout>
    </ErrorBoundary>
  );
}

function displayPath(cwd: string): string {
  if (process.platform === "win32") return cwd;
  const home = os.homedir();
  return cwd === home || cwd.startsWith(home + "/") ? `~${cwd.slice(home.length)}` : cwd;
}

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(packageJson.version);
  process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`committer v${packageJson.version} — AI-powered commit messages for git

USAGE
  committer                 Start the TUI
  committer -c, --cli       Run the commit cycle in the terminal (no TUI)
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
from within the TUI.`);
  process.exit(0);
}

if (process.argv.includes("-c") || process.argv.includes("--cli")) {
  const { runCli } = await import("./cli");
  await runCli();
  process.exit(0);
}

const renderer = await createCliRenderer();
renderer.setTerminalTitle(`COMMITTER v${packageJson.version} ${displayPath(process.cwd())}`);
createRoot(renderer).render(<App />);
