import type { TextareaRenderable } from "@opentui/core";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../../../store/app-store";
import { useKeyboardStore } from "../../../../store/keyboard-store";
import { useCommitFlowStore } from "./store";
import { theme } from "../../../../lib/theme";

const SCOPE_ID = "edit-message";
const SUBMIT_KEY_BINDINGS = [{ name: "return", ctrl: true, action: "submit" as const }];

export function EditMessagePopover() {
  const message = useCommitFlowStore((s) => s.message);
  const setMessage = useCommitFlowStore((s) => s.setMessage);
  const commit = useCommitFlowStore((s) => s.commit);
  const closePopUp = useAppStore((s) => s.closePopUp);
  const messageRef = useRef<TextareaRenderable>(null);

  const flushAndCommit = () => {
    setMessage(messageRef.current?.plainText ?? message ?? "");
    closePopUp();
    commit();
  };

  const stateRef = useRef({ closePopUp });
  stateRef.current = { closePopUp };

  useEffect(() => {
    useKeyboardStore.getState().push({
      id: SCOPE_ID,
      handleKey: (key) => {
        if (key.name === "escape") {
          stateRef.current.closePopUp();
          return true;
        }
        return false;
      },
    });
    return () => useKeyboardStore.getState().pop(SCOPE_ID);
  }, []);

  return (
    <box flexDirection="column" padding={1}>
      <box marginBottom={1} paddingX={1} borderStyle="rounded" borderColor={theme.accent.cyan}>
        <textarea
          ref={messageRef}
          initialValue={message ?? ""}
          height={10}
          backgroundColor="transparent"
          focused
          keyBindings={SUBMIT_KEY_BINDINGS}
          onSubmit={flushAndCommit}
        />
      </box>
      <text fg={theme.text.muted}>Ctrl+Enter to commit, Esc to cancel</text>
    </box>
  );
}
