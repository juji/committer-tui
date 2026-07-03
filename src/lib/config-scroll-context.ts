import { createContext, useContext } from "react";
import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";

const ConfigScrollContext = createContext<RefObject<ScrollBoxRenderable | null> | null>(null);

export const ConfigScrollProvider = ConfigScrollContext.Provider;

export function useConfigScrollRef() {
  return useContext(ConfigScrollContext);
}
