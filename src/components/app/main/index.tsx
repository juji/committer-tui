import type { ScrollBoxRenderable } from "@opentui/core";
import { useRef } from "react";
import { SCROLLBAR_OPTIONS } from "../../../lib/globals";
import { CommitFileList } from "./commit";
import { useCommitFlowStore } from "./commit/store";
import { useAppScreenStore } from "../store";
import { HistoryEntryView } from "./history";

export function Main() {
  const commitFlowActive = useCommitFlowStore((s) => s.active);
  const viewingCommit = useAppScreenStore((s) => s.viewingCommit);
  const focusArea = useAppScreenStore((s) => s.focusArea);
  const isFocused = focusArea === "main";
  const scrollRef = useRef<ScrollBoxRenderable>(null);

  return (
    <scrollbox
      id="main-area"
      ref={scrollRef}
      flexGrow={1}
      padding={1}
      scrollbarOptions={SCROLLBAR_OPTIONS}
      backgroundColor={isFocused ? "#0a0a0a" : "#000000"}
      focused={isFocused}
    >
      {viewingCommit && <HistoryEntryView />}
      {!viewingCommit && commitFlowActive && <CommitFileList scrollRef={scrollRef} />}
    </scrollbox>
  );
}
