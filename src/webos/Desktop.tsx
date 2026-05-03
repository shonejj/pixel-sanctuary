import { useEffect, useState } from "react";
import { closeAllWindows, initPersistence, minimizeAll, retile, setLauncher, setSettings, setTilingMode, useWebOS } from "./kernel";
import { useRegisterAllApps } from "./apps";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowFrame } from "./Window";
import { NotificationCenter } from "./NotificationCenter";
import { Launcher } from "./Launcher";
import { CommandPalette } from "./CommandPalette";
import { SettingsPanel } from "./SettingsPanel";
import { Tour } from "./Tour";
import { BootLoader } from "./BootLoader";
import { setBooted, setPalette, closeWindow, toggleMaximize, toggleMinimize, snapWindow } from "./kernel";

export function Desktop() {
  const windows = useWebOS(s => s.windows);
  const apps = useWebOS(s => s.apps);
  const wp = useWebOS(s => s.wallpaper);
  const shell = useWebOS(s => s.shell);
  const booted = useWebOS(s => s.booted);
  const focusedId = useWebOS(s => s.focusedId);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);

  useRegisterAllApps();

  useEffect(() => { initPersistence(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "k") { e.preventDefault(); setPalette(true); }
      else if (meta && e.code === "Space") { e.preventDefault(); setLauncher(true); }
      else if (meta && e.key.toLowerCase() === "w" && focusedId) { e.preventDefault(); closeWindow(focusedId); }
      else if (meta && e.key.toLowerCase() === "m" && focusedId) { e.preventDefault(); toggleMinimize(focusedId); }
      else if (e.key === "F11" && focusedId) { e.preventDefault(); toggleMaximize(focusedId); }
      else if (meta && e.key === "ArrowLeft" && focusedId) { e.preventDefault(); snapWindow(focusedId, "left"); }
      else if (meta && e.key === "ArrowRight" && focusedId) { e.preventDefault(); snapWindow(focusedId, "right"); }
      else if (meta && e.key.toLowerCase() === "t" && !e.shiftKey) {
        const cur = useWebOS.getState().tilingMode; setTilingMode(!cur);
      } else if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        const ws = useWebOS.getState().windows.filter(w => !w.minimized);
        if (ws.length > 1) {
          const idx = ws.findIndex(w => w.id === focusedId);
          const next = ws[(idx + 1) % ws.length];
          useWebOS.setState({ focusedId: next.id });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId]);

  if (!booted) return <BootLoader onDone={() => setBooted(true)} />;

  const wpClass = wp === "aurora" ? "desktop-wallpaper" : `wallpaper-${wp}`;

  return (
    <div className={`fixed inset-0 ${wpClass} overflow-hidden`}
      onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY }); }}
      onClick={() => setCtx(null)}
    >
      <MenuBar />
      <NotificationCenter />

      <div className={`absolute inset-0 ${shell === "windows" ? "pt-0 pb-12" : "pt-8 pb-20"}`}>
        {windows.map(w => {
          const App = apps[w.appId]?.Component;
          if (!App) return null;
          return <WindowFrame key={w.id} win={w}><App windowId={w.id} params={w.params} /></WindowFrame>;
        })}
      </div>

      <Dock />
      <Launcher />
      <CommandPalette />
      <SettingsPanel />
      <Tour />

      {ctx && (
        <div className="fixed z-[10500] bg-popover border rounded-lg shadow-2xl py-1 min-w-[200px] text-sm" style={{ left: Math.min(ctx.x, window.innerWidth - 220), top: Math.min(ctx.y, window.innerHeight - 280) }}>
          {[
            { l: "Open launcher", fn: () => setLauncher(true) },
            { l: "Command palette", fn: () => setPalette(true) },
            { l: "Tile windows now", fn: retile },
            { l: useWebOS.getState().tilingMode ? "Disable auto-tiling" : "Enable auto-tiling", fn: () => setTilingMode(!useWebOS.getState().tilingMode) },
            { l: "Minimize all", fn: minimizeAll },
            { l: "Close all windows", fn: closeAllWindows },
            { l: "Settings", fn: () => setSettings(true) },
          ].map(o => (
            <button key={o.l} onClick={() => { o.fn(); setCtx(null); }} className="w-full text-left px-3 py-1.5 hover:bg-accent">{o.l}</button>
          ))}
        </div>
      )}

      {windows.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/80 px-4">
            <div className="text-4xl sm:text-6xl font-bold tracking-tight drop-shadow-lg bg-gradient-to-br from-purple-200 to-pink-200 bg-clip-text text-transparent">WebOS</div>
            <div className="text-xs sm:text-sm mt-2 opacity-80">Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded mono">⌘K</kbd> to search · <kbd className="px-1.5 py-0.5 bg-white/20 rounded mono">⌘Space</kbd> for apps · right-click for menu</div>
          </div>
        </div>
      )}
    </div>
  );
}
