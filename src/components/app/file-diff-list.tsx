import type { FileDiff } from "../../lib/git";
import { theme } from "../../lib/theme";

export function FileDiffList({ diffs, focused }: { diffs: FileDiff[]; focused: boolean }) {
  return (
    <scrollbox
      maxHeight={20}
      minHeight={5}
      paddingY={1}
      backgroundColor={theme.bg.card}
      focused={focused}
      onMouseScroll={(e) => e.stopPropagation()}
    >
      {diffs.map((d) => (
        <box key={d.path} flexDirection="column" marginBottom={1}>
          <text fg={theme.accent.blue} marginLeft={2}>
            {d.path}
          </text>
          <box height={1} flexShrink={0} />
          <diff diff={d.diff} height={d.diff.split("\n").length + 2} showLineNumbers />
        </box>
      ))}
    </scrollbox>
  );
}
