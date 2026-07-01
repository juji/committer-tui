import { SCROLLBAR_OPTIONS } from "../../../lib/globals";

const STATUS_WIDTH = 30;

export function Sidebar() {
  return <scrollbox id="sidebar-area" width={STATUS_WIDTH} backgroundColor="#0d0d0d" scrollbarOptions={SCROLLBAR_OPTIONS} />;
}
