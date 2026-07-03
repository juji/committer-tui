import { useTerminalDimensions } from "@opentui/react";
import { useEffect } from "react";
import { Bottom } from "./bottom";
import { Main } from "./main";
import { Sidebar } from "./sidebar";
import { useAppScreenStore } from "./store";
import { useKeyboardStore } from "../../store/keyboard-store";
import { useStateRef } from "../../lib/use-state-ref";

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

  const stateRef = useStateRef({ focusArea, toggleSidebar, cycleFocusArea, focusHistory, viewHistoryEntry });

  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        const s = stateRef.current;
        if (key.ctrl && key.name === "y") {
          s.toggleSidebar();
          return true;
        }
        if (key.name === "tab") {
          s.cycleFocusArea(key.shift ? -1 : 1);
          return true;
        }
        if (s.focusArea !== "history") return false;
        if (key.name === "up") {
          s.focusHistory(-1);
          return true;
        }
        if (key.name === "down") {
          s.focusHistory(1);
          return true;
        }
        if (key.name === "return") {
          s.viewHistoryEntry();
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, []);

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
