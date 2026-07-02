import type { KeyEvent } from "@opentui/core";
import { useAppContext, useTerminalDimensions } from "@opentui/react";
import { useEffect, useRef } from "react";
import { Bottom } from "./bottom";
import { Main } from "./main";
import { Sidebar } from "./sidebar";
import { useAppScreenStore } from "./store";
import { useKeyboardStore } from "../../store/keyboard-store";

const STATUS_MIN_WIDTH = 100;
const SCOPE_ID = "app";

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const sidebarOpen = useAppScreenStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppScreenStore((s) => s.toggleSidebar);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const cycleFocusArea = useAppScreenStore((s) => s.cycleFocusArea);
  const focusHistory = useAppScreenStore((s) => s.focusHistory);
  const viewHistoryEntry = useAppScreenStore((s) => s.viewHistoryEntry);
  const showStatus = width >= STATUS_MIN_WIDTH;

  const { keyHandler } = useAppContext();
  const stateRef = useRef({ focusArea, toggleSidebar, cycleFocusArea, focusHistory, viewHistoryEntry });
  stateRef.current = { focusArea, toggleSidebar, cycleFocusArea, focusHistory, viewHistoryEntry };

  useEffect(() => {
    const onKey = (key: KeyEvent) => {
      const s = stateRef.current;
      if (key.ctrl && key.name === "y") {
        s.toggleSidebar();
        return;
      }
      if (key.name === "tab") {
        s.cycleFocusArea();
        return;
      }
      if (s.focusArea !== "history") return;
      if (key.name === "up") {
        s.focusHistory(-1);
        return;
      }
      if (key.name === "down") {
        s.focusHistory(1);
        return;
      }
      if (key.name === "return") {
        s.viewHistoryEntry();
      }
    };

    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      activate: () => keyHandler?.on("keypress", onKey),
      deactivate: () => keyHandler?.off("keypress", onKey),
    });
    return () => useKeyboardStore.getState().pop();
  }, [keyHandler]);

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
