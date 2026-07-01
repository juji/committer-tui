import { useTerminalDimensions } from "@opentui/react";

const STATUS_MIN_WIDTH = 80;
const STATUS_WIDTH = 30;
const BUTTONS_HEIGHT = 5;

export function AppScreen() {
  const { width } = useTerminalDimensions();
  const showStatus = width >= STATUS_MIN_WIDTH;

  return (
    <box flexDirection="row" flexGrow={1}>
      <box flexDirection="column" flexGrow={1}>
        <box id="main-area" flexGrow={1} />
        <box id="bottom-area" height={BUTTONS_HEIGHT} backgroundColor="#0f0f0f" />
      </box>

      {showStatus && <box id="sidebar-area" width={STATUS_WIDTH} backgroundColor="#0d0d0d" />}
    </box>
  );
}
