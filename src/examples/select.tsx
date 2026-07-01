import type { SelectOption } from '@opentui/core';

const FRUIT_OPTIONS = [
  { name: "Apple" },
  { name: "Banana", description: "A yellow fruit" },
  { name: "Cherry", description: "A small red fruit" },
  { name: "Fig", description: "A soft purple fruit" },
  { name: "Honeydew", description: "A pale green melon" },
] as SelectOption[];

export function SelectExample({ focused }: { focused?: boolean }) {
  return (
    <select
      options={FRUIT_OPTIONS}
      height={4}
      focused={focused}
      focusedBackgroundColor="#333333"
    />
  );
}
