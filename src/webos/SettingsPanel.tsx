import { useState } from "react";
import { useWebOS, setSettings, setShell, setTheme, setAccentHue, setWallpaper, setTilingMode, addCustomApp, removeCustomApp, setTourSeen, startTour } from "./kernel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export function SettingsPanel() {
  const open = useWebOS(s => s.settingsOpen);
  const shell = useWebOS(s => s.shell);
  const theme = useWebOS(s => s.theme);
  const hue = useWebOS(s => s.accentHue);
  const wp = useWebOS(s => s.wallpaper);
  const tiling = useWebOS(s => s.tilingMode);
  const customApps = useWebOS(s => s.customApps);

  const [tab, setTab] = useState<"appearance"|"apps"|"about">("appearance");
  const [name, setName] = useState(""); const [src, setSrc] = useState(""); const [mode, setMode] = useState<"html"|"url">("url");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10300] bg-black/50 flex items-center justify-center fade-in" onClick={() => setSettings(false)}>
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="w-44 bg-muted/50 border-r p-3 space-y-1">
          <div className="font-bold mb-2 px-2">Settings</div>
          {["appearance","apps","about"].map(t => (
            <button key={t} onClick={() => setTab(t as any)} className={`w-full text-left p-2 rounded text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize">{tab}</h2>
            <button onClick={() => setSettings(false)}><X size={18}/></button>
          </div>
          {tab === "appearance" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Shell theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["macos","windows","gnome","hyprland"] as const).map(s => (
                    <button key={s} onClick={() => setShell(s)} className={`p-3 border-2 rounded-xl text-sm capitalize ${shell === s ? "border-primary bg-primary/10" : "border-border"}`}>
                      <div className="text-2xl mb-1">{s === "macos" ? "🍎" : s === "windows" ? "🪟" : s === "gnome" ? "🐧" : "💻"}</div>{s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Changes shell layout: macOS dock+menubar, Windows taskbar+start menu, GNOME activities, Hyprland tiling.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>Light</Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>Dark</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent hue: {hue}°</label>
                <input type="range" min={0} max={360} value={hue} onChange={(e) => setAccentHue(+e.target.value)} className="w-full" />
                <div className="h-3 rounded mt-2" style={{ background: `linear-gradient(to right, ${Array.from({length:7},(_,i)=>`oklch(0.65 0.22 ${i*60})`).join(",")})` }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Wallpaper</label>
                <div className="grid grid-cols-5 gap-2">
                  {["aurora","mono","sunset","forest","ocean"].map(w => (
                    <button key={w} onClick={() => setWallpaper(w)} className={`h-16 rounded-lg border-2 ${wp === w ? "border-primary" : "border-transparent"} ${w === "aurora" ? "desktop-wallpaper" : `wallpaper-${w}`}`} title={w} />
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={tiling} onChange={(e) => setTilingMode(e.target.checked)} />Auto-tile windows (Hyprland mode)</label>
              </div>
              <Button variant="outline" onClick={() => { setSettings(false); setTourSeen(false); startTour(); }}>Replay tour</Button>
            </div>
          )}
          {tab === "apps" && (
            <div className="space-y-4">
              <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
                <h3 className="font-medium">Add custom app</h3>
                <Input placeholder="App name" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" variant={mode === "url" ? "default" : "outline"} onClick={() => setMode("url")}>URL</Button>
                  <Button size="sm" variant={mode === "html" ? "default" : "outline"} onClick={() => setMode("html")}>HTML</Button>
                </div>
                {mode === "url"
                  ? <Input placeholder="https://example.com" value={src} onChange={(e) => setSrc(e.target.value)} />
                  : <textarea placeholder="<h1>Hello</h1><script>alert('hi')</script>" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full h-32 p-2 border rounded mono text-xs bg-card" />
                }
                <Button onClick={() => {
                  if (!name || !src) return;
                  addCustomApp({ id: "custom-" + Date.now(), name, category: "creative", customMode: mode, customSource: src, accent: "linear-gradient(135deg,#8b5cf6,#ec4899)" } as any);
                  setName(""); setSrc("");
                }}><Plus size={14} className="mr-1"/>Add</Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Installed custom apps ({customApps.length})</h3>
                {customApps.length === 0 && <div className="text-sm text-muted-foreground">None yet.</div>}
                {customApps.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 border rounded mb-1">
                    <div><div className="font-medium text-sm">{a.name}</div><div className="text-xs text-muted-foreground">{a.customMode}</div></div>
                    <Button size="sm" variant="ghost" onClick={() => removeCustomApp(a.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "about" && (
            <div className="space-y-3 text-sm">
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">◉ WebOS</div>
              <p>A complete browser-based desktop OS with 35+ apps. Privacy-first, offline-capable, zero servers.</p>
              <div className="text-xs text-muted-foreground space-y-1 mono">
                <div>Version 1.0.0</div>
                <div>Theme: {shell} · {theme}</div>
                <div>Built with React, TanStack, shadcn/ui, Monaco, DuckDB-WASM</div>
              </div>
              <div className="pt-2">
                <h4 className="font-medium mb-1">Keyboard shortcuts</h4>
                <ul className="text-xs space-y-0.5 mono">
                  <li>Ctrl/⌘ + K — Command palette</li>
                  <li>Ctrl/⌘ + Space — Launcher</li>
                  <li>Alt + Tab — Cycle windows</li>
                  <li>Ctrl + W — Close focused window</li>
                  <li>Ctrl + M — Minimize focused</li>
                  <li>F11 — Toggle maximize</li>
                  <li>Ctrl + ← / → — Snap left/right</li>
                  <li>Ctrl + T — Toggle tiling mode</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
