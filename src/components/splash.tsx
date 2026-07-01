import { useEffect } from "react";
import { useAppStore } from "../store/app-store";

export function Splash() {
  const loadConfig = useAppStore((s) => s.loadConfig);

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <box flexGrow={1} alignItems="center" justifyContent="center">
      <text>COMMITTER</text>
    </box>
  );
}
