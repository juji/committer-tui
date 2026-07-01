import { useTerminalDimensions } from "@opentui/react";
import { Bottom } from "./bottom";
import { Main } from "./main";
import { Sidebar } from "./sidebar";

const STATUS_MIN_WIDTH = 80;

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const showStatus = width >= STATUS_MIN_WIDTH;

  return (
    <box flexDirection="row" flexGrow={1}>
      <box flexDirection="column" flexGrow={1}>
        <Main />
        <Bottom />
      </box>

      {showStatus && <Sidebar />}
    </box>
  );
}
