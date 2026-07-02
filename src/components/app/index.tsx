import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { Bottom } from "./bottom";
import { Main } from "./main";
import { Sidebar } from "./sidebar";
import { useAppScreenStore } from "./store";

const STATUS_MIN_WIDTH = 100;

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const sidebarOpen = useAppScreenStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppScreenStore((s) => s.toggleSidebar);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const cycleFocusArea = useAppScreenStore((s) => s.cycleFocusArea);
  const focusHistory = useAppScreenStore((s) => s.focusHistory);
  const viewHistoryEntry = useAppScreenStore((s) => s.viewHistoryEntry);
  const showStatus = width >= STATUS_MIN_WIDTH;

  useKeyboard((key) => {
    if (key.ctrl && key.name === "y") {
      toggleSidebar();
      return;
    }
    if (key.name === "tab") {
      cycleFocusArea();
      return;
    }
    if (focusArea !== "history") return;
    if (key.name === "up") {
      focusHistory(-1);
      return;
    }
    if (key.name === "down") {
      focusHistory(1);
      return;
    }
    if (key.name === "return") {
      viewHistoryEntry();
    }
  });

  return (
    <box flexDirection="row" flexGrow={1}>
      <box flexDirection="column" flexGrow={1}>
        <Main />
        <Bottom />
      </box>

      {showStatus && <Sidebar />}
      {!showStatus && sidebarOpen && (
        <box position="absolute" top={0} right={0} bottom={0} zIndex={10}>
          <Sidebar />
        </box>
      )}
    </box>
  );
}
