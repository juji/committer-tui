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
        <box flexGrow={1} borderStyle="rounded" borderColor="#333333" title="Main" titleColor="#ffffff" />
        <box height={BUTTONS_HEIGHT} borderStyle="rounded" borderColor="#333333" title="Buttons" titleColor="#ffffff" />
      </box>

      {showStatus && (
        <box width={STATUS_WIDTH} borderStyle="rounded" borderColor="#333333" title="Status" titleColor="#ffffff" />
      )}
    </box>
  );
}
