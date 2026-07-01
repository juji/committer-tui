import { useTerminalDimensions } from "@opentui/react";
import { SCROLLBAR_OPTIONS } from "../../lib/globals";

const STATUS_MIN_WIDTH = 80;
const STATUS_WIDTH = 30;
const BUTTONS_HEIGHT = 5;

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const showStatus = width >= STATUS_MIN_WIDTH;

  return (
    <box flexDirection="row" flexGrow={1}>
      <box flexDirection="column" flexGrow={1}>
        <scrollbox id="main-area" flexGrow={1} padding={1} scrollbarOptions={SCROLLBAR_OPTIONS} />
        <box id="bottom-area" height={BUTTONS_HEIGHT} backgroundColor="#151515" />
      </box>

      {showStatus && (
        <scrollbox id="sidebar-area" width={STATUS_WIDTH} backgroundColor="#0d0d0d" scrollbarOptions={SCROLLBAR_OPTIONS} />
      )}
    </box>
  );
}
