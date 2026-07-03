import { useEffect } from "react";
import { useAppScreenStore } from "../store";
import { useAppStore } from "../../../store/app-store";
import { useCommitFlowStore } from "../main/commit/store";
import { useThemeStore } from "../../../store/theme-store";

const BUTTONS_HEIGHT = 5;

interface ButtonSpec {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onActivate: () => void;
}

export function Bottom() {
  const theme = useThemeStore((s) => s.theme);
  const config = useAppStore((s) => s.config);
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
  const closeHistoryEntry = useAppScreenStore((s) => s.closeHistoryEntry);
  const loadHistory = useAppScreenStore((s) => s.loadHistory);

  const handleStartCommitFlow = async () => {
    closeHistoryEntry();
    setFocusArea("main");
    await startCommitFlow();
    // If no files after starting, focus bottom
    if (useCommitFlowStore.getState().files.length === 0) {
      useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
    }
  };

  const handleConfirmSelection = async () => {
    await confirmSelection(config);
    const state = useCommitFlowStore.getState();
    if (state.error) {
      useAppScreenStore.setState({ focusArea: "bottom", focusedButtonIndex: 0 });
    } else if (state.message) {
      useAppScreenStore.getState().setFocusedButtonIndex(0);
    }
  };

  const handleCommit = async () => {
    await commit();
    if (useCommitFlowStore.getState().committed) {
      await loadHistory();
    }
  };

  const buttons: ButtonSpec[] = [];
  if (committing) {
    buttons.push({ label: "Committing...", onActivate: () => {} });
  } else if (committed || hasResult) {
    if (!committed && hasMessage) {
      buttons.push({ label: "Confirm", onActivate: handleCommit });
      buttons.push({ label: "Edit", onActivate: () => openPopUp("edit-message") });
    }
    buttons.push({ label: committed ? "Commit" : "Redo", onActivate: handleStartCommitFlow });
  } else if (commitFlowActive) {
    buttons.push({
      label: generating ? "Generating..." : "Generate",
      disabled: generating,
      onActivate: generating ? () => {} : handleConfirmSelection,
    });
  } else {
    buttons.push({ label: "Commit", onActivate: handleStartCommitFlow });
  }

  const isFocused = focusArea === "bottom";
  const safeIndex = focusedButtonIndex % buttons.length;

  useEffect(() => {
    setBottomButtonCount(buttons.length);
  }, [buttons.length, setBottomButtonCount]);

  return (
    <box id="bottom-area" height={BUTTONS_HEIGHT} flexDirection="row" backgroundColor={theme.bg.card} padding={1}>
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
  const theme = useThemeStore.getState().theme;
  const borderColor = disabled
    ? theme.bg.border
    : focused
      ? theme.accent.cyan
      : active
        ? theme.bg.borderLight
        : theme.bg.border;
  const textColor = disabled ? theme.text.dim : focused ? theme.accent.cyan : theme.text.secondary;

  return (
    <box
      focusable
      focused={focused}
      borderStyle="rounded"
      borderColor={borderColor}
      focusedBorderColor={disabled ? theme.bg.border : theme.accent.cyan}
      paddingLeft={1}
      paddingRight={1}
      marginLeft={marginLeft}
      onKeyDown={(key) => {
        if (disabled) return;
        if (key.name === "return") onActivate();
      }}
      onMouseDown={() => {
        if (disabled) return;
        onClick?.();
        onActivate();
      }}
    >
      <text fg={textColor}>{label}</text>
    </box>
  );
}
