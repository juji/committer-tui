import { useEffect } from "react";
import { useAppScreenStore } from "../store";
import { useCommitFlowStore } from "../main/commit/store";

const BUTTONS_HEIGHT = 5;

interface ButtonSpec {
  label: string;
  active?: boolean;
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
  const focusedButtonIndex = useAppScreenStore((s) => s.focusedButtonIndex);
  const setBottomButtonCount = useAppScreenStore((s) => s.setBottomButtonCount);

  const buttons: ButtonSpec[] = [];
  if (committing) {
    buttons.push({ label: "Committing...", onActivate: () => {} });
  } else if (committed || hasResult) {
    if (!committed && hasMessage) buttons.push({ label: "Confirm", onActivate: commit });
    buttons.push({ label: committed ? "Commit" : "Redo", onActivate: startCommitFlow });
  } else if (commitFlowActive) {
    buttons.push({ label: generating ? "Generating..." : "Generate", onActivate: confirmSelection });
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
          key={b.label}
          label={b.label}
          active={b.active}
          focused={isFocused && i === safeIndex}
          marginLeft={i > 0 ? 1 : 0}
          onActivate={b.onActivate}
        />
      ))}
    </box>
  );
}

function Button({
  label,
  active,
  focused,
  marginLeft,
  onActivate,
}: {
  label: string;
  active?: boolean;
  focused?: boolean;
  marginLeft?: number;
  onActivate: () => void;
}) {
  return (
    <box
      focusable
      focused={focused}
      borderStyle="rounded"
      borderColor={focused ? "#4a9eff" : active ? "#888888" : "#3a3a3a"}
      paddingLeft={1}
      paddingRight={1}
      marginLeft={marginLeft}
      onKeyDown={(key) => {
        if (key.name === "return") onActivate();
      }}
    >
      <text>{label}</text>
    </box>
  );
}
