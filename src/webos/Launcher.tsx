import { useEffect, useMemo, useState } from "react";
import { setLauncher, launchApp, useWebOS } from "./kernel";
import { CATEGORY_LABELS } from "./apps";
import { Search, X } from "lucide-react";

export function Launcher() {
  const open = useWebOS(s => s.launcherOpen);
  const apps = useWebOS(s => s.apps);
  const [q, setQ] = useState("");

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const grouped = useMemo(() => {
    const list = Object.values(apps).filter(a =>
      !q || a.name.toLowerCase().includes(q.toLowerCase()) || (a.tags || []).some(t => t.includes(q.toLowerCase()))
    );
    const map: Record<string, typeof list> = {};
    list.forEach(a => { (map[a.category] = map[a.category] || []).push(a); });
    return map;
  }, [apps, q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10100] glass fade-in flex flex-col" onClick={() => setLauncher(false)}>
      <div className="p-6 max-w-5xl mx-auto w-full flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-xl px-4 py-3 shadow-lg">
            <Search size={18} className="text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps…" className="flex-1 bg-transparent outline-none text-base" />
          </div>
          <button onClick={() => setLauncher(false)} className="p-3 rounded-xl bg-card border"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto pr-2">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="mb-6">
              <div className="text-xs uppercase tracking-wider text-foreground/60 mb-3">{CATEGORY_LABELS[cat] || cat}</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {list.map(a => (
                  <button key={a.id} onClick={() => launchApp(a.id)} className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 transition">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition" style={{ background: a.accent }}>{a.icon}</div>
                    <span className="text-xs text-center text-foreground/90 line-clamp-2">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!Object.keys(grouped).length && <div className="text-center text-muted-foreground p-12">No apps found</div>}
        </div>
      </div>
    </div>
  );
}
