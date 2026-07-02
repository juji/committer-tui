import { useToastStore } from "../store/toast-store";
import { theme } from "../lib/theme";

export function Toast() {
  const message = useToastStore((s) => s.message);

  if (!message) return null;

  return (
    <box position="absolute" top={2} left={2} zIndex={20}>
      <box backgroundColor={theme.accent.purpleDim} borderStyle="rounded" borderColor={theme.accent.purple} paddingLeft={2} paddingRight={2}>
        <text fg={theme.text.primary}>{message}</text>
      </box>
    </box>
  );
}
