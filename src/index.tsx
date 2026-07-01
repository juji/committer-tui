import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
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
      {screen === "app" && <text>App</text>}
    </Layout>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
