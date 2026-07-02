import { useEffect } from "react";
import { useAppScreenStore } from "../store";
import { useAppStore } from "../../../store/app-store";
import { useCommitFlowStore } from "../main/commit/store";

const BUTTONS_HEIGHT = 5;

interface ButtonSpec {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onActivate: () => void;
}

export function Bottom() {
  const commitFlowActive = useCommitFlowStore((s) => s.active);
  const startCommitFlow = useCommitFlowStore((s) => s.startCommitFlow);
  const hasMessage = useCommitFlowStore((s) => s.message !== null);
  const hasResult = useCommitFlowStore((s) => s.message !== null || s.error !== null || (s.active && s.files.length === 0));
  const generating = useCommitFlowStore((s) => s.generating);
  const committing = useCommitFlowStore((s) => s.committing);
  const committed = useCommitFlowStore((s) => s.committed);
  const confirmSelection = useCommitFlowStore((s) => s.confirmSelection);
  const commit = useCommitFlowStore((s) => s.commit);

  const focusArea = useAppScreenStore((s) => s.focusArea);
  const setFocusArea = useAppScreenStore((s) => s.setFocusArea);
  const focusedButtonIndex = useAppScreenStore((s) => s.focusedButtonIndex);
  const setFocusedButtonIndex = useAppScreenStore((s) => s.setFocusedButtonIndex);
  const setBottomButtonCount = useAppScreenStore((s) => s.setBottomButtonCount);
  const openPopUp = useAppStore((s) => s.openPopUp);
  const popUpOpen = useAppStore((s) => s.popUpOpen);

  const buttons: ButtonSpec[] = [];
  if (committing) {
    buttons.push({ label: "Committing...", onActivate: () => {} });
  } else if (committed || hasResult) {
    if (!committed && hasMessage) {
      buttons.push({ label: "Confirm", onActivate: commit });
      buttons.push({ label: "Edit", onActivate: () => openPopUp("edit-message") });
    }
    buttons.push({ label: committed ? "Commit" : "Redo", onActivate: startCommitFlow });
  } else if (commitFlowActive) {
    buttons.push({
      label: generating ? "Generating..." : "Generate",
      disabled: generating,
      onActivate: generating ? () => {} : confirmSelection,
    });
  } else {
    buttons.push({ label: "Commit", onActivate: startCommitFlow });
  }

  const isFocused = focusArea === "bottom";
  const safeIndex = focusedButtonIndex % buttons.length;

  useEffect(() => {
    setBottomButtonCount(buttons.length);
  }, [buttons.length, setBottomButtonCount]);

  return (
    <box id="bottom-area" height={BUTTONS_HEIGHT} flexDirection="row" backgroundColor="#151515" padding={1}>
      {buttons.map((b, i) => (
        <Button
          key={`${b.label}-${popUpOpen ?? "none"}`}
          label={b.label}
          active={b.active}
          disabled={b.disabled}
          focused={isFocused && i === safeIndex}
          marginLeft={i > 0 ? 1 : 0}
          onActivate={b.onActivate}
          onClick={() => {
            setFocusArea("bottom");
            setFocusedButtonIndex(i);
          }}
        />
      ))}
    </box>
  );
}

function Button({
  label,
  active,
  disabled,
  focused,
  marginLeft,
  onActivate,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  focused?: boolean;
  marginLeft?: number;
  onActivate: () => void;
  onClick?: () => void;
}) {
  return (
    <box
      focusable
      focused={focused}
      borderStyle="rounded"
      borderColor={disabled ? "#2a2a2a" : focused ? "#4a9eff" : active ? "#888888" : "#3a3a3a"}
      focusedBorderColor={disabled ? "#2a2a2a" : "#4a9eff"}
      paddingLeft={1}
      paddingRight={1}
      marginLeft={marginLeft}
      onKeyDown={(key) => {
        if (key.name === "return") onActivate();
      }}
      onMouseDown={() => {
        if (disabled) return;
        onClick?.();
        onActivate();
      }}
    >
      <text fg={disabled ? "#5a5a5a" : undefined}>{label}</text>
    </box>
  );
}
