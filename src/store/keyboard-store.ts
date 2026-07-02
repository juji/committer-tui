import type { KeyEvent } from "@opentui/core";
import { create } from "zustand";

export interface KeyboardScope {
  id: string;
  handleKey: (key: KeyEvent) => boolean | void;
}

interface KeyboardState {
  stack: KeyboardScope[];
  push: (scope: KeyboardScope) => void;
  pop: (id: string) => void;
  dispatch: (key: KeyEvent) => void;
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  stack: [],

  push: (scope) => {
    set({ stack: [...get().stack, scope] });
  },

  pop: (id) => {
    set({ stack: get().stack.filter((s) => s.id !== id) });
  },

  dispatch: (key) => {
    const { stack } = get();
    const topId = stack.at(-1)?.id;
    if (!topId) return;

    const segments = topId.split("/");
    for (let i = segments.length; i > 0; i--) {
      const id = segments.slice(0, i).join("/");
      const scope = stack.find((s) => s.id === id);
      if (scope?.handleKey(key)) return;
    }
  },
}));
