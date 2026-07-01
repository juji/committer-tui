import { useKeyboard } from "@opentui/react";
import { useAppStore } from "../store/app-store";

export function useGlobalShortcuts() {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);

  useKeyboard((key) => {
    if (screen === "splash") return;
    if (key.ctrl && key.name === "g") setScreen("config");
  });
}
