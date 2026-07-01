import { CliRenderEvents, type Selection } from "@opentui/core";
import { useRenderer } from "@opentui/react";
import { useEffect } from "react";
import { useToastStore } from "../store/toast-store";

export function useAutoCopySelection() {
  const renderer = useRenderer();
  const show = useToastStore((s) => s.show);

  useEffect(() => {
    if (!renderer) return;

    const onSelection = (selection: Selection) => {
      const text = selection.getSelectedText();
      if (!text) return;
      renderer.copyToClipboardOSC52(text);
      show("Copied to clipboard");
    };

    renderer.on(CliRenderEvents.SELECTION, onSelection);
    return () => {
      renderer.off(CliRenderEvents.SELECTION, onSelection);
    };
  }, [renderer, show]);
}
