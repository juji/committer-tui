import { SCROLLBAR_OPTIONS } from "../../../lib/globals";
import { CommitFileList } from "../commit";
import { useCommitFlowStore } from "../commit/store";

export function Main() {
  const active = useCommitFlowStore((s) => s.active);

  if (active) {
    return <CommitFileList />;
  }

  return <scrollbox id="main-area" flexGrow={1} padding={1} scrollbarOptions={SCROLLBAR_OPTIONS} />;
}
