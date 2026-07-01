import { useToastStore } from "../store/toast-store";

export function Toast() {
  const message = useToastStore((s) => s.message);

  if (!message) return null;

  return (
    <box position="absolute" top={2} left={2} zIndex={20}>
      <box backgroundColor="#f97316" borderStyle="rounded" borderColor="#f97316" paddingLeft={2} paddingRight={2}>
        <text fg="#000000">{message}</text>
      </box>
    </box>
  );
}
