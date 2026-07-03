import { createContext, useContext } from "react";
import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";

export const ConfigScrollContext = createContext<RefObject<ScrollBoxRenderable | null> | null>(null);

export function useConfigScrollRef() {
  return useContext(ConfigScrollContext);
}
