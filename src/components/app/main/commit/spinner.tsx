import { useEffect, useState } from "react";
import { theme } from "../../../../lib/theme";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner({ label }: { label: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <text>
      <span fg={theme.accent.cyan}>{FRAMES[frame]}</span>
      <span fg={theme.text.muted}> {label}</span>
    </text>
  );
}
