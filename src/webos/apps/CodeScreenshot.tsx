import { useState } from "react";
import { AppShell, downloadBlob } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const THEMES = [
  { name: "Midnight", bg: "linear-gradient(135deg,#1e3a8a,#9333ea)" },
  { name: "Sunset", bg: "linear-gradient(135deg,#f97316,#ec4899)" },
  { name: "Forest", bg: "linear-gradient(135deg,#065f46,#0f766e)" },
  { name: "Mono", bg: "#0f172a" },
];

export function CodeScreenshot() {
  const [code, setCode] = useState(`function fib(n) {\n  if (n < 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}\n\nconsole.log(fib(10));`);
  const [theme, setTheme] = useState(THEMES[0]);
  const [padding, setPadding] = useState(48);
  const [chrome, setChrome] = useState(true);

  function exportPng() {
    // Render via SVG -> canvas (no html-to-image dep)
    const lines = code.split("\n");
    const fontSize = 14;
    const lh = 20;
    const padX = 24;
    const padY = chrome ? 40 : 20;
    const innerW = 720;
    const innerH = padY + lines.length * lh + 16;
    const totalW = innerW + padding * 2;
    const totalH = innerH + padding * 2;

    const c = document.createElement("canvas");
    c.width = totalW * 2;
    c.height = totalH * 2;
    const ctx = c.getContext("2d")!;
    ctx.scale(2, 2);
    // bg
    if (theme.bg.startsWith("linear-gradient")) {
      const m = theme.bg.match(/#[0-9a-f]{6}/gi);
      const g = ctx.createLinearGradient(0, 0, totalW, totalH);
      g.addColorStop(0, m?.[0] || "#1e3a8a");
      g.addColorStop(1, m?.[1] || "#9333ea");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = theme.bg;
    }
    ctx.fillRect(0, 0, totalW, totalH);
    // window
    ctx.fillStyle = "#0f172a";
    roundRect(ctx, padding, padding, innerW, innerH, 12);
    ctx.fill();
    if (chrome) {
      ["#ef4444", "#eab308", "#22c55e"].forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(padding + 18 + i * 20, padding + 20, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.fillStyle = "#e2e8f0";
    ctx.font = `${fontSize}px 'SF Mono', Consolas, monospace`;
    lines.forEach((line, i) => {
      ctx.fillText(line, padding + padX, padding + padY + (i + 1) * lh);
    });
    c.toBlob((b) => b && downloadBlob(b, "code.png"));
  }

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-3">
          <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 mono text-sm min-h-[300px]" />
          <div className="bg-card border rounded-xl p-3 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {THEMES.map((t) => (
                <button key={t.name} onClick={() => setTheme(t)} className={`px-3 py-1 rounded text-xs ${theme.name === t.name ? "ring-2 ring-primary" : ""}`} style={{ background: t.bg, color: "white" }}>
                  {t.name}
                </button>
              ))}
            </div>
            <label className="text-sm flex items-center gap-2">Padding: <input type="range" min={16} max={96} value={padding} onChange={(e) => setPadding(+e.target.value)} className="flex-1" /> {padding}px</label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={chrome} onChange={(e) => setChrome(e.target.checked)} /> macOS window chrome
            </label>
            <Button onClick={exportPng} className="w-full">Download PNG</Button>
          </div>
        </div>
        <div className="rounded-xl flex items-center justify-center" style={{ background: theme.bg, padding }}>
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-[720px]">
            {chrome && (
              <div className="px-3 py-2 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            )}
            <pre className="mono text-sm text-slate-200 px-6 pb-6 pt-2 whitespace-pre-wrap break-words">{code}</pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
