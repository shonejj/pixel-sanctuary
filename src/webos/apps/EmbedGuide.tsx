import { useState } from "react";
import { Copy, Check, BookOpen, Code2, Package, Globe, Zap } from "lucide-react";
import { useWebOS, type AppCategory } from "../kernel";

const SECTIONS = [
  { id: "overview", label: "Overview", Icon: BookOpen },
  { id: "embed", label: "Embed in your site", Icon: Globe },
  { id: "custom", label: "Add custom apps", Icon: Package },
  { id: "tweak", label: "Tweak the OS", Icon: Zap },
  { id: "build", label: "Build your own app", Icon: Code2 },
] as const;

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group my-2">
      <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] overflow-x-auto mono leading-relaxed">{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-slate-800 text-slate-200 p-1.5 rounded">
        {copied ? <Check size={12}/> : <Copy size={12}/>}
      </button>
    </div>
  );
}

export function EmbedGuide() {
  const [tab, setTab] = useState<typeof SECTIONS[number]["id"]>("overview");
  const apps = useWebOS((s) => s.apps);
  const list = Object.values(apps);
  const byCat = list.reduce<Record<string, typeof list>>((acc, a) => {
    (acc[a.category] ||= []).push(a); return acc;
  }, {} as any);

  return (
    <div className="flex h-full bg-background">
      <div className="w-44 border-r bg-muted/30 p-2 space-y-0.5">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setTab(s.id)}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${tab === s.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
            <s.Icon size={13}/>{s.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-5 prose-sm max-w-none">
        {tab === "overview" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">WebOS — Documentation</h1>
            <p className="text-sm text-muted-foreground mb-4">A complete browser-based operating system. Privacy-first, offline-capable, zero servers required.</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <Stat label="Apps" value={list.length}/>
              <Stat label="Categories" value={Object.keys(byCat).length}/>
              <Stat label="License" value="MIT"/>
            </div>

            <h2 className="text-base font-semibold mb-2">App catalog</h2>
            {(["system","productivity","lifestyle","creative","tech","games"] as AppCategory[]).map((c) => byCat[c] && (
              <div key={c} className="mb-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{c}</div>
                <div className="flex flex-wrap gap-1.5">
                  {byCat[c].map((a) => (
                    <span key={a.id} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 border rounded-md bg-card">
                      <span className="w-3.5 h-3.5 inline-flex items-center justify-center">{a.icon}</span>{a.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "embed" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Embed WebOS in your site</h1>
            <p className="text-sm">Once published (to GitHub Pages, Netlify, Vercel, or your domain), drop it into any page with an iframe.</p>
            <Code>{`<iframe
  src="https://YOUR_USER.github.io/pixel-sanctuary/"
  style="width:100%; height:100vh; border:0;"
  allow="camera; microphone; display-capture; clipboard-read; clipboard-write; fullscreen"
></iframe>`}</Code>
            <h3 className="font-semibold mt-4 mb-1">Recommended iframe permissions</h3>
            <ul className="text-sm list-disc pl-5 space-y-0.5">
              <li><b>camera / microphone</b> — Camera app, Voice Recorder</li>
              <li><b>display-capture</b> — Screen Recorder</li>
              <li><b>clipboard-read / write</b> — copy / paste across apps</li>
              <li><b>fullscreen</b> — true OS feel</li>
            </ul>
            <h3 className="font-semibold mt-4 mb-1">Open a specific app via URL</h3>
            <Code>{`https://YOUR_HOST/#open=duckdb
https://YOUR_HOST/#open=browser&url=https://wikipedia.org`}</Code>
            <p className="text-xs text-muted-foreground">Add a hash-listener in <code>BootLoader.tsx</code> that calls <code>launchApp(id, params)</code>.</p>
          </div>
        )}

        {tab === "custom" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Add your own apps</h1>
            <p className="text-sm">Two ways — zero rebuild required:</p>
            <h3 className="font-semibold mt-3 mb-1">1. From the UI (Settings → Custom Apps)</h3>
            <p className="text-sm">Paste a URL or raw HTML, give it a name, upload an icon (or let the site favicon load). Done.</p>
            <h3 className="font-semibold mt-3 mb-1">2. Programmatically</h3>
            <Code>{`import { registerApp } from "@/webos/kernel";

registerApp({
  id: "my-app",
  name: "My App",
  icon: <span>🚀</span>,
  category: "creative",
  accent: "linear-gradient(135deg,#06b6d4,#3b82f6)",
  Component: ({ windowId, params }) => <div>Hello!</div>,
});`}</Code>
            <h3 className="font-semibold mt-3 mb-1">Iframe embedding caveats</h3>
            <p className="text-sm">Sites that send <code>X-Frame-Options: DENY</code> or strict CSP (Google, Facebook, X, YouTube) cannot be embedded — that's the site's policy, not a WebOS limit. Use the built-in <b>Browser</b> app fallback "Open externally".</p>
          </div>
        )}

        {tab === "tweak" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Tweak everything</h1>
            <h3 className="font-semibold mt-2 mb-1">Themes</h3>
            <p className="text-sm">Settings → Appearance for shell layout (macOS / Windows / GNOME / Hyprland), accent color, wallpaper.</p>
            <h3 className="font-semibold mt-3 mb-1">UI style</h3>
            <p className="text-sm">Settings → UI Style — 6 system-wide looks: Glass / Material / Japanese / Cartoon / Neumorphic / Flat.</p>
            <h3 className="font-semibold mt-3 mb-1">Design tokens</h3>
            <p className="text-sm">All colors live as semantic tokens in <code>src/styles.css</code> (HSL channels). Override them to rebrand.</p>
            <Code>{`:root {
  --accent-hue: 265;        /* drives the primary palette */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: oklch(0.65 0.22 var(--accent-hue));
}`}</Code>
            <h3 className="font-semibold mt-3 mb-1">Window manager flags</h3>
            <p className="text-sm">Auto-tile mode (Hyprland-like) is in Appearance. Tiling logic in <code>retile()</code> inside <code>kernel.ts</code>.</p>
            <h3 className="font-semibold mt-3 mb-1">Keyboard shortcuts</h3>
            <ul className="text-xs mono space-y-0.5">
              <li>⌘/Ctrl + K → command palette</li>
              <li>⌘/Ctrl + Space → launcher</li>
              <li>Alt + Tab → cycle windows</li>
              <li>Ctrl + ← / → → snap halves</li>
              <li>F11 → maximize · Ctrl+W → close · Ctrl+M → minimize</li>
            </ul>
          </div>
        )}

        {tab === "build" && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Build a new app</h1>
            <p className="text-sm">An app is just a React component. Create a file under <code>src/webos/apps/</code> and register it.</p>
            <Code>{`// src/webos/apps/HelloApp.tsx
export function HelloApp({ windowId }: { windowId: string }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl">Hello, WebOS!</h1>
    </div>
  );
}

// then in src/webos/apps.tsx
import { HelloApp } from "./apps/HelloApp";
ALL_APPS.push({
  id: "hello",
  name: "Hello",
  icon: <span>👋</span>,
  category: "creative",
  Component: HelloApp,
});`}</Code>

            <h3 className="font-semibold mt-3 mb-1">Persisted local state</h3>
            <Code>{`import { useLocalStorage } from "@/webos/AppShell";
const [count, setCount] = useLocalStorage("hello-count", 0);`}</Code>

            <h3 className="font-semibold mt-3 mb-1">Open files, notify, clipboard</h3>
            <Code>{`import { notify, pushClipboard, launchApp } from "@/webos/kernel";
notify("Done", "Saved 3 files");
pushClipboard("copied!");
launchApp("notes", { initialText: "from another app" });`}</Code>

            <h3 className="font-semibold mt-3 mb-1">Deploy</h3>
            <p className="text-sm">A push to <code>main</code> triggers <code>.github/workflows/deploy.yml</code> and publishes to GitHub Pages automatically. The workflow runs <code>bun run build:pages</code> with the correct base URL and uploads <code>dist/client</code>.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
