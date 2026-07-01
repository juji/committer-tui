import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot, useKeyboard } from "@opentui/react";
import { useState } from "react";
import { InputExample } from "./examples/input";
import { TextareaExample } from "./examples/textarea";
import { SelectExample } from "./examples/select";
import { TabSelectExample } from "./examples/tab-select";

const FIELD_COUNT = 4;

function App() {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusIndex((i) => {
        if (key.shift) return i === null ? FIELD_COUNT - 1 : i === 0 ? null : i - 1;
        return i === null ? 0 : i === FIELD_COUNT - 1 ? null : i + 1;
      });
    }
  });

  return (
    <box
      flexDirection="column"
      width={40}
      flexGrow={1}
      justifyContent="center"
    >
      <text attributes={TextAttributes.DIM}>Tab/Shift+Tab to switch focus</text>
      <InputExample focused={focusIndex === 0} />
      <TextareaExample focused={focusIndex === 1} />
      <SelectExample focused={focusIndex === 2} />
      <TabSelectExample focused={focusIndex === 3} />
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
