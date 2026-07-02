import type { ScrollBoxRenderable } from "@opentui/core";
import { useThemeStore } from "../store/theme-store";

let _configScrollRef: { current: ScrollBoxRenderable | null } | null = null;

export function setConfigScrollRef(ref: { current: ScrollBoxRenderable | null }) {
  _configScrollRef = ref;
}

export function scrollConfigTo(childId: string) {
  _configScrollRef?.current?.scrollChildIntoView(childId);
}

export function getScrollbarOptions() {
  const theme = useThemeStore.getState().theme;
  return {
    trackOptions: { backgroundColor: theme.scrollbar.track, foregroundColor: theme.scrollbar.thumb },
  };
}
