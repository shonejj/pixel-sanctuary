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
    <div
      className="fixed inset-0 z-[10100] fade-in flex flex-col"
      style={{ background: "rgba(8,10,20,0.55)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}
      onClick={() => setLauncher(false)}
    >
      <div className="px-4 sm:px-8 pt-6 pb-4 max-w-6xl mx-auto w-full flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-card/90 border rounded-2xl px-4 py-3 shadow-2xl">
            <Search size={18} className="text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps…" className="flex-1 bg-transparent outline-none text-base" />
          </div>
          <button onClick={() => setLauncher(false)} className="p-3 rounded-2xl bg-card/90 border shadow-lg"><X size={18} /></button>
        </div>
        <div
          className="flex-1 overflow-y-auto pr-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as any}
        >
          <style>{`.launcher-scroll::-webkit-scrollbar{display:none}`}</style>
          <div className="launcher-scroll">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="mb-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-4 px-1">{CATEGORY_LABELS[cat] || cat}</div>
                <div className="grid gap-x-3 gap-y-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}>
                  {list.map(a => (
                    <button
                      key={a.id}
                      onClick={() => launchApp(a.id)}
                      className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white/10 active:bg-white/15 transition"
                    >
                      <div
                        className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200"
                        style={{ background: a.accent }}
                      >{a.icon}</div>
                      <span className="text-[11px] leading-tight text-center text-white/95 line-clamp-2 max-w-[88px]">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!Object.keys(grouped).length && <div className="text-center text-white/60 p-12">No apps found</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
