import { useKeyboard } from "@opentui/react";
import { useAppScreenStore } from "../store";

const BUTTONS_HEIGHT = 5;

export function Bottom({ showSidebarToggle }: { showSidebarToggle: boolean }) {
  const sidebarOpen = useAppScreenStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppScreenStore((s) => s.toggleSidebar);

  useKeyboard((key) => {
    if (showSidebarToggle && key.name === "y" && key.ctrl) toggleSidebar();
  });

  return (
    <box id="bottom-area" height={BUTTONS_HEIGHT} flexDirection="row" backgroundColor="#151515" padding={1}>
      <Button label="Commit (Enter)" />
      {showSidebarToggle && (
        <Button label={sidebarOpen ? "Hide History (ctrl+y)" : "Show History (ctrl+y)"} active={sidebarOpen} marginLeft={1} />
      )}
    </box>
  );
}

function Button({ label, active, marginLeft }: { label: string; active?: boolean; marginLeft?: number }) {
  return (
    <box
      borderStyle="rounded"
      borderColor={active ? "#888888" : "#3a3a3a"}
      paddingLeft={1}
      paddingRight={1}
      marginLeft={marginLeft}
    >
      <text>{label}</text>
    </box>
  );
}
