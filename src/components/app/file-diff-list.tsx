import type { FileDiff } from "../../lib/git";

export function FileDiffList({ diffs, focused }: { diffs: FileDiff[]; focused: boolean }) {
  return (
    <scrollbox
      maxHeight={20}
      minHeight={5}
      paddingY={1}
      backgroundColor="#111111"
      focused={focused}
      onMouseScroll={(e) => e.stopPropagation()}
    >
      {diffs.map((d) => (
        <box key={d.path} flexDirection="column" marginBottom={1}>
          <text fg="#6b6b6b" marginLeft={2}>
            {d.path}
          </text>
          <box height={1} flexShrink={0} />
          <diff diff={d.diff} height={d.diff.split("\n").length + 2} showLineNumbers />
        </box>
      ))}
    </scrollbox>
  );
}
