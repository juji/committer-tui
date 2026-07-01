import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Layout } from "./components/layout";
import { Splash } from "./components/splash";

function App() {
  return (
    <Layout>
      <Splash />
    </Layout>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
