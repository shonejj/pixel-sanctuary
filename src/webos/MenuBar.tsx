import { useEffect, useState } from "react";
import { setLauncher, setPalette, setSettings, setStartMenu, setTheme, useWebOS } from "./kernel";
import { Moon, Sun, Wifi, BatteryFull, Volume2, Search, Settings as SettingsIcon, LayoutGrid } from "lucide-react";

export function MenuBar() {
  const theme = useWebOS((s) => s.theme);
  const shell = useWebOS((s) => s.shell);
  const focusedId = useWebOS((s) => s.focusedId);
  const windows = useWebOS((s) => s.windows);
  const apps = useWebOS((s) => s.apps);
  const focusedApp = focusedId ? apps[windows.find((w) => w.id === focusedId)?.appId ?? ""] : undefined;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (shell === "windows") return null; // Windows uses bottom taskbar only

  const isGnome = shell === "gnome";

  return (
    <div className="fixed top-0 inset-x-0 h-8 z-[10000] glass flex items-center px-2 sm:px-3 text-[12px] font-medium gap-2">
      <button onClick={() => isGnome ? setLauncher(true) : setStartMenu(true)} className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 transition" title="Activities / Apple menu">
        <span className="font-semibold tracking-tight">{isGnome ? "Activities" : "◉"}</span>
      </button>
      <span className="text-foreground/70 hidden sm:inline truncate max-w-[200px]">{focusedApp?.name ?? "Desktop"}</span>
      <div className="flex-1" />
      <button onClick={() => setPalette(true)} className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10" title="Search (Ctrl+K)"><Search size={13} /></button>
      <button onClick={() => setLauncher(true)} className="px-2 py-0.5 rounded hover:bg-white/10" title="Apps (Super)"><LayoutGrid size={13} /></button>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-2 py-0.5 rounded hover:bg-white/10" title="Toggle theme">
        {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
      </button>
      <button onClick={() => setSettings(true)} className="px-2 py-0.5 rounded hover:bg-white/10" title="Settings"><SettingsIcon size={13} /></button>
      <Wifi size={13} className="hide-mobile" />
      <Volume2 size={13} className="hide-mobile" />
      <BatteryFull size={13} className="hide-mobile" />
      <span className="tabular-nums text-foreground/80" suppressHydrationWarning>
        {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--:--"}
      </span>
    </div>
  );
}
