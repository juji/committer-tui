#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import os from "node:os";
import { AppScreen } from "./components/app";
import { Layout } from "./components/layout";
import { Splash } from "./components/splash";
import { useGlobalShortcuts } from "./lib/shortcuts";
import { useAppStore } from "./store/app-store";

function App() {
  const screen = useAppStore((s) => s.screen);
  useGlobalShortcuts();

  return (
    <Layout>
      {screen === "splash" && <Splash />}
      {screen === "app" && <AppScreen />}
    </Layout>
  );
}

function displayPath(cwd: string): string {
  if (process.platform === "win32") return cwd;
  const home = os.homedir();
  return cwd === home || cwd.startsWith(home + "/") ? `~${cwd.slice(home.length)}` : cwd;
}

const renderer = await createCliRenderer();
renderer.setTerminalTitle(`COMMITTER ${displayPath(process.cwd())}`);
createRoot(renderer).render(<App />);
