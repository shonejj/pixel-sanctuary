import { useEffect, useState } from "react";
import { setTheme, useWebOS } from "./kernel";
import { Moon, Sun, Wifi, BatteryFull, Volume2 } from "lucide-react";

export function MenuBar() {
  const theme = useWebOS((s) => s.theme);
  const focusedId = useWebOS((s) => s.focusedId);
  const windows = useWebOS((s) => s.windows);
  const apps = useWebOS((s) => s.apps);
  const focusedApp = focusedId
    ? apps[windows.find((w) => w.id === focusedId)?.appId ?? ""]
    : undefined;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 h-7 z-[10000] glass flex items-center px-3 text-[12px] font-medium">
      <div className="flex items-center gap-3">
        <span className="font-semibold tracking-tight">◉ WebOS</span>
        <span className="text-foreground/70">{focusedApp?.name ?? "Desktop"}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-foreground/80">
        <button
          aria-label="toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Wifi size={14} />
        <Volume2 size={14} />
        <BatteryFull size={14} />
        <span className="tabular-nums">
          {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
          {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
