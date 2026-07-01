export function InputExample({ focused }: { focused?: boolean }) {
  return (
    <input
      placeholder="Name"
      focused={focused}
      focusedBackgroundColor="#333333"
    />
  );
}
