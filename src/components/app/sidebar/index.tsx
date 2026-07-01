import { SCROLLBAR_OPTIONS } from "../../../lib/globals";

const STATUS_WIDTH = 30;

export function Sidebar() {
  return (
    <box id="sidebar-area" width={STATUS_WIDTH} flexDirection="column" backgroundColor="#0d0d0d">
      <box height={3} paddingY={1} paddingX={2} backgroundColor="#151515">
        <text fg="#6b6b6b">History (↑↓ to scroll)</text>
      </box>
      <scrollbox
        flexGrow={1}
        padding={1}
        backgroundColor="#0d0d0d"
        scrollbarOptions={SCROLLBAR_OPTIONS}
        stickyScroll
        stickyStart="bottom"
      />
    </box>
  );
}
