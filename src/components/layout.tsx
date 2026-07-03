import { RGBA, type ScrollBoxRenderable } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { ConfigScreen } from "./config";
import { EditMessagePopover } from "./app/main/commit/edit-message";
import { Toast } from "./toast";
import { useAppStore } from "../store/app-store";
import { useAutoCopySelection } from "../lib/clipboard";
import { useThemeStore } from "../store/theme-store";
import { ConfigScrollProvider } from "../lib/config-scroll-context";

const OVERLAY_COLOR = RGBA.fromValues(0, 0, 0, 0.7);

const MIN_WIDTH = 60;
const MIN_HEIGHT = 15;

export function Layout({ children }: { children?: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const config = useAppStore((s) => s.config);
  const popUpOpen = useAppStore((s) => s.popUpOpen);
  const screen = useAppStore((s) => s.screen);
  const configScrollRef = useRef<ScrollBoxRenderable>(null);
  const { width, height } = useTerminalDimensions();
  const tooSmall = width < MIN_WIDTH || height < MIN_HEIGHT;

  useAutoCopySelection();

  const hints = ["ctrl+c exit"];
  if (!popUpOpen) {
    hints.push("ctrl+g config");
    if (screen === "app") hints.push("ctrl+y history");
  } else if (config) {
    hints.push("esc back");
  }

  if (tooSmall) {
    return (
      <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center" backgroundColor={theme.bg.base}>
        <text fg={theme.accent.cyan} attributes={1}>Terminal too small</text>
        <box height={1} flexShrink={0} />
        <text fg={theme.text.muted}>Resize to at least {MIN_WIDTH}x{MIN_HEIGHT}</text>
        <text fg={theme.text.dim}>{width}x{height} current</text>
      </box>
    );
  }

  return (
    <box flexDirection="column" flexGrow={1}>
      <box flexGrow={1} backgroundColor={theme.bg.base}>
        {children}
        {popUpOpen === "config" && (
          <box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            backgroundColor={OVERLAY_COLOR}
            zIndex={10}
          >
            <scrollbox
              ref={configScrollRef}
              width="95%"
              maxWidth={80}
              maxHeight="95%"
              borderStyle="rounded"
              borderColor={theme.bg.borderLight}
              title="Config"
              titleColor={theme.accent.cyan}
              backgroundColor={theme.bg.elevated}
              zIndex={11}
            >
              <ConfigScrollProvider value={configScrollRef}>
                <ConfigScreen />
              </ConfigScrollProvider>
            </scrollbox>
          </box>
        )}
        {popUpOpen === "edit-message" && (
          <box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            backgroundColor={OVERLAY_COLOR}
            zIndex={10}
          >
            <box
              width="95%"
              maxWidth={80}
              borderStyle="rounded"
              borderColor={theme.bg.borderLight}
              title="Edit Commit Message"
              titleColor={theme.accent.cyan}
              backgroundColor={theme.bg.elevated}
              zIndex={11}
            >
              <EditMessagePopover />
            </box>
          </box>
        )}
        <Toast />
      </box>
      <box height={1} backgroundColor={theme.bg.surface} paddingLeft={1}>
        <text fg={theme.text.muted}>{hints.join("  ·  ")}</text>
      </box>
    </box>
  );
}
