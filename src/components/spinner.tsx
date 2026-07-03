import { useEffect, useState } from "react";
import { useThemeStore } from "../store/theme-store";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner({ label }: { label?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <text>
      <span fg={theme.accent.cyan}>{FRAMES[frame]}</span>
      {label && <span fg={theme.text.muted}> {label}</span>}
    </text>
  );
}
