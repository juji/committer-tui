import { useToastStore } from "../store/toast-store";
import { useThemeStore } from "../store/theme-store";

export function Toast() {
  const theme = useThemeStore((s) => s.theme);
  const message = useToastStore((s) => s.message);

  if (!message) return null;

  return (
    <box position="absolute" top={2} left={2} zIndex={20}>
      <box backgroundColor={theme.accent.purpleDim} paddingY={1} paddingLeft={2} paddingRight={2}>
        <text fg={theme.text.primary}>{message}</text>
      </box>
    </box>
  );
}
