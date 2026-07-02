import { create } from "zustand";

export interface KeyboardScope {
  id: string;
  activate?: () => void;
  deactivate?: () => void;
}

interface KeyboardState {
  stack: KeyboardScope[];
  push: (scope: KeyboardScope) => void;
  pop: () => void;
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  stack: [],

  push: (scope) => {
    const { stack } = get();
    stack.at(-1)?.deactivate?.();
    set({ stack: [...stack, scope] });
    scope.activate?.();
  },

  pop: () => {
    const { stack } = get();
    const removed = stack.at(-1);
    if (!removed) return;
    removed.deactivate?.();
    const next = stack.slice(0, -1);
    set({ stack: next });
    next.at(-1)?.activate?.();
  },
}));
