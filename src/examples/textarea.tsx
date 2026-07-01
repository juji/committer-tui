export function TextareaExample({ focused }: { focused?: boolean }) {
  return (
    <textarea
      placeholder="Comments"
      height={4}
      focused={focused}
      focusedBackgroundColor="#333333"
    />
  );
}
