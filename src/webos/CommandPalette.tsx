import { useEffect, useState } from "react";
import { setPalette, launchApp, useWebOS, setSettings, setLauncher, closeAllWindows, minimizeAll, setTilingMode, setTheme } from "./kernel";

type Action = { id: string; label: string; hint?: string; run: () => void };

export function CommandPalette() {
  const open = useWebOS(s => s.paletteOpen);
  const apps = useWebOS(s => s.apps);
  const tiling = useWebOS(s => s.tilingMode);
  const theme = useWebOS(s => s.theme);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => { if (!open) { setQ(""); setIdx(0); } }, [open]);

  const actions: Action[] = [
    ...Object.values(apps).map(a => ({ id: a.id, label: `Open ${a.name}`, hint: a.category, run: () => launchApp(a.id) })),
    { id: "_settings", label: "Open Settings", run: () => setSettings(true) },
    { id: "_launcher", label: "Show App Launcher", run: () => setLauncher(true) },
    { id: "_close-all", label: "Close all windows", run: closeAllWindows },
    { id: "_min-all", label: "Minimize all windows", run: minimizeAll },
    { id: "_tile", label: tiling ? "Disable tiling" : "Enable tiling (Hyprland-mode)", run: () => setTilingMode(!tiling) },
    { id: "_theme", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, run: () => setTheme(theme === "dark" ? "light" : "dark") },
  ];
  const filtered = actions.filter(a => !q || a.label.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10200] bg-black/40 fade-in flex items-start justify-center pt-32" onClick={() => setPalette(false)}>
      <div className="w-full max-w-xl bg-popover border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((idx + 1) % filtered.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((idx - 1 + filtered.length) % filtered.length); }
            if (e.key === "Enter" && filtered[idx]) { filtered[idx].run(); setPalette(false); }
            if (e.key === "Escape") setPalette(false);
          }}
          placeholder="Type a command or search apps…" className="w-full p-4 bg-transparent outline-none text-base border-b" />
        <div className="max-h-96 overflow-auto">
          {filtered.map((a, i) => (
            <button key={a.id} onMouseEnter={() => setIdx(i)} onClick={() => { a.run(); setPalette(false); }}
              className={`w-full text-left p-3 flex items-center justify-between text-sm ${i === idx ? "bg-accent" : ""}`}>
              <span>{a.label}</span>
              {a.hint && <span className="text-xs text-muted-foreground">{a.hint}</span>}
            </button>
          ))}
          {!filtered.length && <div className="p-6 text-center text-muted-foreground text-sm">No matches</div>}
        </div>
        <div className="border-t p-2 text-[10px] text-muted-foreground flex gap-3 mono">
          <span>↑↓ navigate</span><span>↵ run</span><span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
