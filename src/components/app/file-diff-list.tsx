import type { FileDiff } from "@/lib/git";
import { useThemeStore } from "@/store/theme-store";

export function FileDiffList({ diffs, focused, scrollable = true }: { diffs: FileDiff[]; focused: boolean; scrollable?: boolean }) {
  const theme = useThemeStore((s) => s.theme);
  const content = (
    <>
      {diffs.map((d) => (
        <box key={d.path} flexDirection="column" marginBottom={1}>
          <text fg={theme.accent.blue} marginLeft={2}>
            {d.path}
          </text>
          <box height={1} flexShrink={0} />
          <diff diff={d.diff} height={d.diff.split("\n").length + 2} showLineNumbers />
        </box>
      ))}
    </>
  );

  if (!scrollable) {
    return (
      <box paddingY={1} backgroundColor={theme.bg.card}>
        {content}
      </box>
    );
  }

  return (
    <scrollbox
      maxHeight={20}
      minHeight={5}
      paddingY={1}
      backgroundColor={theme.bg.card}
      focused={focused}
      onMouseScroll={(e) => e.stopPropagation()}
    >
      {content}
    </scrollbox>
  );
}
