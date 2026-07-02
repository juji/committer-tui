import type { FileDiff } from "../../lib/git";

export function FileDiffList({ diffs, focused }: { diffs: FileDiff[]; focused: boolean }) {
  return (
    <scrollbox flexGrow={1} minHeight={5} focused={focused}>
      {diffs.map((d) => (
        <box key={d.path} flexDirection="column" marginBottom={1}>
          <text fg="#6b6b6b">{d.path}</text>
          <box height={1} flexShrink={0} />
          <diff diff={d.diff} height={d.diff.split("\n").length + 2} showLineNumbers />
        </box>
      ))}
    </scrollbox>
  );
}
