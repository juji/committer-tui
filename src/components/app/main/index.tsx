import { SCROLLBAR_OPTIONS } from "../../../lib/globals";

export function Main() {
  return <scrollbox id="main-area" flexGrow={1} padding={1} scrollbarOptions={SCROLLBAR_OPTIONS} />;
}
