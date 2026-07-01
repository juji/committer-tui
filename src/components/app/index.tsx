import { useTerminalDimensions } from "@opentui/react";
import { Bottom } from "./bottom";
import { Main } from "./main";
import { Sidebar } from "./sidebar";
import { useAppScreenStore } from "./store";

const STATUS_MIN_WIDTH = 80;

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const sidebarOpen = useAppScreenStore((s) => s.sidebarOpen);
  const showStatus = width >= STATUS_MIN_WIDTH;

  return (
    <box flexDirection="row" flexGrow={1}>
      <box flexDirection="column" flexGrow={1}>
        <Main />
        <Bottom showSidebarToggle={!showStatus} />
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
