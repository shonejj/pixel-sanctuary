import { useState } from "react";
import { launchApp, useWebOS, setLauncher, setStartMenu, closeWindow } from "./kernel";
import { CATEGORY_LABELS } from "./apps";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Dock() {
  const apps = useWebOS(s => s.apps);
  const windows = useWebOS(s => s.windows);
  const shell = useWebOS(s => s.shell);

  // Hyprland: minimal bottom bar
  if (shell === "hyprland") {
    return (
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] flex gap-1 bg-black/70 px-2 py-1 rounded">
        {windows.filter(w => !w.minimized).slice(0, 8).map(w => {
          const a = apps[w.appId]; if (!a) return null;
          return <button key={w.id} onClick={() => useWebOS.setState({ focusedId: w.id })} className="px-2 py-0.5 text-[10px] mono text-white/80 hover:text-white rounded hover:bg-white/10">[{a.name}]</button>;
        })}
        <button onClick={() => setLauncher(true)} className="px-2 py-0.5 text-[10px] mono text-white/80 hover:text-white rounded hover:bg-white/10">[+]</button>
      </div>
    );
  }

  // Windows: taskbar
  if (shell === "windows") {
    return <WindowsTaskbar />;
  }

  // GNOME: minimal bottom dock with running apps only
  if (shell === "gnome") {
    const running = windows.filter(w => !w.minimized);
    if (!running.length) return null;
    return (
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] glass rounded-2xl px-3 py-2 flex gap-2">
        {running.map(w => {
          const a = apps[w.appId]; if (!a) return null;
          return (
            <button key={w.id} onClick={() => useWebOS.setState({ focusedId: w.id })} title={a.name} className="w-12 h-12 rounded-xl flex items-center justify-center hover:scale-110 transition" style={{ background: a.accent }}>{a.icon}</button>
          );
        })}
      </div>
    );
  }

  // macOS dock (default)
  const popular = ["files","notes","calc","todo","code","duckdb","calendar","clock","palette","md-edit"]
    .map(id => apps[id]).filter(Boolean);

  return (
    <div className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-[9999] max-w-[95vw]">
      <div className="glass rounded-2xl px-2 sm:px-3 py-2 flex items-end gap-1 sm:gap-1.5 shadow-2xl overflow-x-auto scrollbar-thin">
        {popular.map(app => {
          const runningWins = windows.filter(w => w.appId === app.id);
          const running = runningWins.length > 0;
          return (
            <button key={app.id} title={`${app.name}${running ? " (right-click to close)" : ""}`}
              onClick={() => launchApp(app.id)}
              onContextMenu={(e) => { e.preventDefault(); runningWins.forEach(w => closeWindow(w.id)); }}
              className="group relative flex flex-col items-center shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-150 border border-white/10 shadow-md group-hover:scale-125 group-hover:-translate-y-2" style={{ background: app.accent }}>
                {app.icon}
              </div>
              <span className={cn("absolute -bottom-1 w-1 h-1 rounded-full bg-foreground transition-opacity", running ? "opacity-100" : "opacity-0")} />
            </button>
          );
        })}
        <div className="w-px h-10 bg-white/20 mx-1 self-center" />
        <button onClick={() => setLauncher(true)} title="All apps" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center hover:scale-110 transition shrink-0">
          <span className="grid grid-cols-3 gap-0.5">{Array.from({length:9}).map((_,i)=><span key={i} className="w-1 h-1 bg-white rounded-full"/>)}</span>
        </button>
      </div>
    </div>
  );
}

function WindowsTaskbar() {
  const [now, setNow] = useState<Date | null>(null);
  const apps = useWebOS(s => s.apps);
  const windows = useWebOS(s => s.windows);
  const startOpen = useWebOS(s => s.startMenuOpen);
  if (typeof window !== "undefined" && !now) setTimeout(() => setNow(new Date()), 0);

  return (
    <>
      {startOpen && <StartMenu />}
      <div className="fixed bottom-0 inset-x-0 h-12 z-[9999] bg-card/95 backdrop-blur border-t flex items-center px-2 gap-1">
        <button onClick={() => setStartMenu(!startOpen)} className="w-10 h-10 flex items-center justify-center rounded hover:bg-accent">
          <div className="grid grid-cols-2 gap-0.5"><div className="w-2 h-2 bg-blue-500"/><div className="w-2 h-2 bg-blue-400"/><div className="w-2 h-2 bg-blue-300"/><div className="w-2 h-2 bg-blue-500"/></div>
        </button>
        <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-thin">
          {windows.map(w => {
            const a = apps[w.appId]; if (!a) return null;
            return (
              <div key={w.id} className="group relative h-9 flex items-center">
                <button onClick={() => useWebOS.setState({ focusedId: w.id, windows: useWebOS.getState().windows.map(x => x.id === w.id ? {...x, minimized: false} : x) })}
                  className="h-9 px-3 pr-7 flex items-center gap-2 rounded bg-accent/50 hover:bg-accent text-xs">
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: a.accent }}>{a.icon}</div>
                  <span className="hidden sm:inline">{a.name}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); closeWindow(w.id); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><X size={10}/></button>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-right pr-2 tabular-nums" suppressHydrationWarning>
          {now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}<br/>
          <span className="text-[10px] text-muted-foreground">{now?.toLocaleDateString()}</span>
        </div>
      </div>
    </>
  );
}

function StartMenu() {
  const apps = useWebOS(s => s.apps);
  const grouped: Record<string, any[]> = {};
  Object.values(apps).forEach(a => { (grouped[a.category] = grouped[a.category] || []).push(a); });
  return (
    <div className="fixed bottom-12 left-2 z-[9999] w-[480px] max-w-[95vw] max-h-[70vh] bg-card/95 backdrop-blur border rounded-xl shadow-2xl overflow-auto p-4 slide-up">
      <input autoFocus placeholder="Type to search…" className="w-full p-2 mb-3 bg-muted border rounded outline-none text-sm" />
      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="mb-3">
          <div className="text-xs uppercase text-muted-foreground mb-2">{CATEGORY_LABELS[cat]}</div>
          <div className="grid grid-cols-4 gap-2">
            {list.map(a => (
              <button key={a.id} onClick={() => launchApp(a.id)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: a.accent }}>{a.icon}</div>
                <span className="text-[10px] text-center line-clamp-2">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
