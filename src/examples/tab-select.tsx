const SIZE_OPTIONS = [
  { name: "Small", description: "asdf" },
  { name: "Medium", description: "" },
  { name: "Large", description: "" },
];

export function TabSelectExample({ focused }: { focused?: boolean }) {
  return (
    <tab-select
      options={SIZE_OPTIONS}
      focused={focused}
      focusedBackgroundColor="#333333"
    />
  );
}
