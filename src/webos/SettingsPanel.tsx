import { useRef, useState } from "react";
import {
  useWebOS, setSettings, setShell, setTheme, setAccentHue, setWallpaper, setWallpaperCustom,
  setTilingMode, addCustomApp, removeCustomApp, setTourSeen, startTour, setUiStyle,
  type UiStyle, type ShellTheme,
} from "./kernel";
import { WALLPAPERS } from "./Desktop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X, Plus, Apple, AppWindow, Monitor, Terminal, Sun, Moon, Sparkles, Layers,
  Palette as PaletteIcon, Brush, Cherry, Square, Layout, Upload, Image as ImageIcon, Info, AppWindowMac,
} from "lucide-react";

const SHELLS: { id: ShellTheme; name: string; Icon: any }[] = [
  { id: "macos", name: "macOS", Icon: Apple },
  { id: "windows", name: "Windows", Icon: AppWindow },
  { id: "gnome", name: "GNOME", Icon: Monitor },
  { id: "hyprland", name: "Hyprland", Icon: Terminal },
];

const UI_STYLES: { id: UiStyle; name: string; Icon: any; desc: string }[] = [
  { id: "glass", name: "Glassmorphic", Icon: Sparkles, desc: "Frosted, translucent" },
  { id: "material", name: "Material", Icon: Layers, desc: "Google Material Design" },
  { id: "japanese", name: "Japanese", Icon: Cherry, desc: "Minimal, refined" },
  { id: "cartoon", name: "Cartoon", Icon: Brush, desc: "Bold, playful outlines" },
  { id: "neumorphic", name: "Neumorphic", Icon: Layout, desc: "Soft shadows" },
  { id: "flat", name: "Flat / Ant", Icon: Square, desc: "Clean, Ant Design" },
];

export function SettingsPanel() {
  const open = useWebOS(s => s.settingsOpen);
  const shell = useWebOS(s => s.shell);
  const uiStyle = useWebOS(s => s.uiStyle);
  const theme = useWebOS(s => s.theme);
  const hue = useWebOS(s => s.accentHue);
  const wp = useWebOS(s => s.wallpaper);
  const wpCustom = useWebOS(s => s.wallpaperCustom);
  const tiling = useWebOS(s => s.tilingMode);
  const customApps = useWebOS(s => s.customApps);

  const [tab, setTab] = useState<"appearance"|"style"|"apps"|"about">("appearance");
  const [name, setName] = useState("");
  const [src, setSrc] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [mode, setMode] = useState<"html"|"url">("url");
  const fileRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function uploadWallpaper(f: File) {
    const r = new FileReader();
    r.onload = () => setWallpaperCustom(r.result as string);
    r.readAsDataURL(f);
  }

  function uploadIcon(f: File) {
    const r = new FileReader();
    r.onload = () => setIconUrl(r.result as string);
    r.readAsDataURL(f);
  }

  function normalizeUrl(u: string) {
    u = u.trim();
    if (!u) return u;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }

  function addApp() {
    if (!name || !src) return;
    let source = src;
    let icon = iconUrl;
    if (mode === "url") {
      source = normalizeUrl(src);
      if (!icon) {
        try { const u = new URL(source); icon = `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`; } catch {}
      }
    }
    addCustomApp({
      id: "custom-" + Date.now(),
      name,
      category: "creative",
      customMode: mode,
      customSource: source,
      accent: "linear-gradient(135deg,#8b5cf6,#ec4899)",
      iconUrl: icon,
    } as any);
    setName(""); setSrc(""); setIconUrl("");
  }

  return (
    <div className="fixed inset-0 z-[10300] bg-black/60 backdrop-blur-sm flex items-center justify-center fade-in p-2 sm:p-4" onClick={() => setSettings(false)}>
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-4xl h-full sm:h-[85vh] flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="sm:w-52 bg-muted/40 sm:border-r border-b sm:border-b-0 p-3 flex sm:flex-col gap-1 overflow-x-auto">
          <div className="font-bold mb-0 sm:mb-2 px-2 hidden sm:block">Settings</div>
          {[
            { id: "appearance", label: "Appearance", Icon: PaletteIcon },
            { id: "style", label: "UI Style", Icon: Sparkles },
            { id: "apps", label: "Custom Apps", Icon: AppWindowMac },
            { id: "about", label: "About", Icon: Info },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
              <t.Icon size={16}/>{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold capitalize">{tab}</h2>
            <button onClick={() => setSettings(false)} className="p-1.5 rounded hover:bg-accent"><X size={18}/></button>
          </div>

          {tab === "appearance" && (
            <div className="space-y-6">
              <section>
                <label className="block text-sm font-medium mb-2">Shell layout</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SHELLS.map(s => (
                    <button key={s.id} onClick={() => setShell(s.id)}
                      className={`p-3 border-2 rounded-xl text-sm flex flex-col items-center gap-1.5 transition ${shell === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                      <s.Icon size={22} className="text-foreground/80"/>{s.name}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}><Sun size={14} className="mr-1"/>Light</Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}><Moon size={14} className="mr-1"/>Dark</Button>
                </div>
              </section>

              <section>
                <label className="block text-sm font-medium mb-2">Accent hue: {hue}°</label>
                <input type="range" min={0} max={360} value={hue} onChange={(e) => setAccentHue(+e.target.value)} className="w-full" />
                <div className="h-3 rounded mt-2" style={{ background: `linear-gradient(to right, ${Array.from({length:13},(_,i)=>`oklch(0.65 0.22 ${i*30})`).join(",")})` }} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Wallpaper</label>
                  <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadWallpaper(e.target.files[0])} />
                    <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload size={12} className="mr-1"/>Upload</Button>
                    {wpCustom && <Button size="sm" variant="ghost" onClick={() => setWallpaperCustom(null)}>Clear</Button>}
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {WALLPAPERS.map(w => (
                    <button key={w.id} onClick={() => setWallpaper(w.id)} title={w.name}
                      className={`h-20 rounded-lg border-2 overflow-hidden transition ${wp === w.id ? "border-primary ring-2 ring-primary/40" : "border-transparent hover:border-primary/40"}`}>
                      <img src={w.src} alt={w.name} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                  {wpCustom && (
                    <button onClick={() => setWallpaper("custom")}
                      className={`h-20 rounded-lg border-2 overflow-hidden ${wp === "custom" ? "border-primary ring-2 ring-primary/40" : "border-transparent"}`}>
                      <img src={wpCustom} alt="custom" className="w-full h-full object-cover"/>
                    </button>
                  )}
                </div>
              </section>

              <section>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={tiling} onChange={(e) => setTilingMode(e.target.checked)} />
                  Auto-tile windows (Hyprland mode)
                </label>
              </section>

              <Button variant="outline" onClick={() => { setSettings(false); setTourSeen(false); startTour(); }}>Replay tour</Button>
            </div>
          )}

          {tab === "style" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose how every window, button and panel looks across all 35+ apps.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {UI_STYLES.map(s => (
                  <button key={s.id} onClick={() => setUiStyle(s.id)}
                    className={`p-4 border-2 rounded-2xl text-left transition ${uiStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <s.Icon size={26} className="mb-2"/>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "apps" && (
            <div className="space-y-4">
              <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
                <h3 className="font-medium flex items-center gap-2"><Plus size={16}/>Add custom app</h3>
                <Input placeholder="App name (e.g. Google)" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" variant={mode === "url" ? "default" : "outline"} onClick={() => setMode("url")}>Website URL</Button>
                  <Button size="sm" variant={mode === "html" ? "default" : "outline"} onClick={() => setMode("html")}>HTML snippet</Button>
                </div>
                {mode === "url"
                  ? <>
                      <Input placeholder="example.com or https://example.com" value={src} onChange={(e) => setSrc(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Note: many sites (Google, YouTube, Twitter) block embedding via X-Frame-Options. They will not load inside iframes — that's the site's choice, not a bug. Try sites like wikipedia.org, codepen.io, your own pages, etc.</p>
                    </>
                  : <textarea placeholder="<h1>Hello</h1><script>alert('hi')</script>" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full h-32 p-2 border rounded mono text-xs bg-card" />
                }
                <div>
                  <label className="text-xs font-medium mb-1 block">Icon (optional)</label>
                  <div className="flex gap-2 items-center">
                    <input ref={iconRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadIcon(e.target.files[0])} />
                    <Button size="sm" variant="outline" onClick={() => iconRef.current?.click()}><ImageIcon size={12} className="mr-1"/>Upload</Button>
                    <Input placeholder="or paste icon URL" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} className="text-xs"/>
                    {iconUrl && <img src={iconUrl} alt="" className="w-8 h-8 rounded object-cover border"/>}
                  </div>
                  {mode === "url" && <p className="text-[11px] text-muted-foreground mt-1">If empty, the site's favicon will be used automatically.</p>}
                </div>
                <Button onClick={addApp} disabled={!name || !src}><Plus size={14} className="mr-1"/>Install app</Button>
              </div>

              <div>
                <h3 className="font-medium mb-2">Installed custom apps ({customApps.length})</h3>
                {customApps.length === 0 && <div className="text-sm text-muted-foreground">None yet.</div>}
                {customApps.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 border rounded-lg mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {a.iconUrl
                        ? <img src={a.iconUrl} alt="" className="w-8 h-8 rounded object-cover border shrink-0"/>
                        : <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0"><AppWindowMac size={14}/></div>}
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{a.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.customMode} · {(a.customSource || "").slice(0, 60)}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeCustomApp(a.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "about" && (
            <div className="space-y-3 text-sm">
              <div className="text-3xl font-bold bg-gradient-to-br from-primary to-pink-400 bg-clip-text text-transparent">◉ WebOS</div>
              <p>A complete browser-based desktop OS with 35+ apps. Privacy-first, offline-capable, zero servers.</p>
              <div className="text-xs text-muted-foreground space-y-1 mono">
                <div>Version 1.1.0</div>
                <div>Shell: {shell} · Style: {uiStyle} · {theme}</div>
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
