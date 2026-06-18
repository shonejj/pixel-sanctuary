import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Plus, X, ExternalLink, Search, Star } from "lucide-react";
import { useLocalStorage } from "../AppShell";

type Tab = { id: string; url: string; title: string; key: number };

const HOME = "about:home";
const SHORTCUTS = [
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page", emoji: "📚" },
  { name: "MDN", url: "https://developer.mozilla.org/", emoji: "📖" },
  { name: "GitHub", url: "https://github.com/", emoji: "🐙" },
  { name: "CodePen", url: "https://codepen.io/", emoji: "✏️" },
  { name: "Hacker News", url: "https://news.ycombinator.com/", emoji: "🟧" },
  { name: "DuckDuckGo", url: "https://duckduckgo.com/", emoji: "🦆" },
  { name: "Lobsters", url: "https://lobste.rs/", emoji: "🦞" },
  { name: "Excalidraw", url: "https://excalidraw.com/", emoji: "✏️" },
];

function normalize(input: string) {
  const s = input.trim();
  if (!s) return HOME;
  if (s === HOME) return HOME;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(s)) return "https://" + s;
  return `https://duckduckgo.com/?q=${encodeURIComponent(s)}`;
}

export function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: "t1", url: HOME, title: "New Tab", key: 0 }]);
  const [active, setActive] = useState("t1");
  const [bookmarks, setBookmarks] = useLocalStorage<{ name: string; url: string }[]>("webos-browser-bm", []);
  const [addr, setAddr] = useState("");
  const tab = tabs.find((t) => t.id === active)!;

  useEffect(() => { setAddr(tab.url === HOME ? "" : tab.url); }, [active, tab.url]);

  function update(id: string, patch: Partial<Tab>) {
    setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function go(raw: string) {
    const url = normalize(raw);
    update(active, { url, key: tab.key + 1, title: url === HOME ? "New Tab" : url });
  }
  function newTab(url = HOME) {
    const id = "t" + Date.now();
    setTabs((ts) => [...ts, { id, url, title: url === HOME ? "New Tab" : url, key: 0 }]);
    setActive(id);
  }
  function closeTab(id: string) {
    setTabs((ts) => {
      const idx = ts.findIndex((t) => t.id === id);
      const next = ts.filter((t) => t.id !== id);
      if (next.length === 0) return [{ id: "t1", url: HOME, title: "New Tab", key: 0 }];
      if (id === active) setActive(next[Math.max(0, idx - 1)].id);
      return next;
    });
  }

  const isHome = tab.url === HOME;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* tab bar */}
      <div className="flex items-end bg-muted/60 px-1.5 pt-1.5 gap-1 border-b overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <div key={t.id} onClick={() => setActive(t.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer max-w-[180px] ${active === t.id ? "bg-background" : "bg-muted hover:bg-background/60"}`}>
            <span className="truncate flex-1">{t.title.replace(/^https?:\/\//, "")}</span>
            <button onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} className="opacity-40 hover:opacity-100"><X size={11}/></button>
          </div>
        ))}
        <button onClick={() => newTab()} className="px-2 py-1.5 hover:bg-background/60 rounded"><Plus size={13}/></button>
      </div>
      {/* address bar */}
      <div className="flex items-center gap-1 p-1.5 border-b bg-card">
        <button onClick={() => update(active, { key: tab.key + 1 })} className="p-1.5 rounded hover:bg-accent"><RotateCw size={14}/></button>
        <button onClick={() => go(HOME)} className="p-1.5 rounded hover:bg-accent"><Home size={14}/></button>
        <form onSubmit={(e) => { e.preventDefault(); go(addr); }} className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
          <Search size={12} className="opacity-50"/>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Search or enter address"
            className="flex-1 bg-transparent outline-none text-xs"/>
        </form>
        {!isHome && (
          <>
            <button onClick={() => setBookmarks((b) => b.find((x) => x.url === tab.url) ? b : [...b, { name: tab.url, url: tab.url }])}
              className="p-1.5 rounded hover:bg-accent" title="Bookmark"><Star size={14}/></button>
            <a href={tab.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-accent"><ExternalLink size={14}/></a>
          </>
        )}
      </div>
      {/* bookmarks */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 border-b bg-card overflow-x-auto scrollbar-thin">
          {bookmarks.map((b, i) => (
            <button key={i} onClick={() => go(b.url)} className="text-[11px] px-2 py-0.5 rounded hover:bg-accent whitespace-nowrap">
              {b.url.replace(/^https?:\/\//, "").slice(0, 30)}
            </button>
          ))}
        </div>
      )}
      {/* viewport */}
      <div className="flex-1 bg-white overflow-hidden relative">
        {isHome ? (
          <div className="h-full overflow-auto p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">WebOS Browser</h1>
              <p className="text-sm text-muted-foreground mb-6">Sandboxed iframe browser. Some sites block embedding — open them externally.</p>
              <form onSubmit={(e) => { e.preventDefault(); go(addr); }} className="mb-8">
                <input autoFocus value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Type a URL or search…"
                  className="w-full text-base px-4 py-3 bg-card border rounded-xl shadow-sm outline-none focus:ring-2 ring-primary/40"/>
              </form>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {SHORTCUTS.map((s) => (
                  <button key={s.url} onClick={() => go(s.url)}
                    className="p-4 bg-card border rounded-xl hover:shadow-md transition text-center">
                    <div className="text-3xl mb-1">{s.emoji}</div>
                    <div className="text-xs font-medium">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <iframe key={tab.key} src={tab.url} className="w-full h-full border-0" referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-modals"
            onLoad={(e) => { try { const t = (e.target as HTMLIFrameElement).contentDocument?.title; if (t) update(active, { title: t }); } catch {} }}/>
        )}
      </div>
    </div>
  );
}
