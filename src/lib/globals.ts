import { useThemeStore } from "@/store/theme-store";

export function getScrollbarOptions() {
  const theme = useThemeStore.getState().theme;
  return {
    trackOptions: { backgroundColor: theme.scrollbar.track, foregroundColor: theme.scrollbar.thumb },
  };
}
