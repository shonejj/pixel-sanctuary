import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Button } from "@/components/ui/button";
import { pushClipboard } from "../kernel";

export function PaletteBuilder() {
  const [base, setBase] = useState("#6366f1");
  const palette = useMemo(() => generate(base), [base]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-[260px_1fr] gap-4 h-full">
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="text-sm font-semibold">Base color</div>
          <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="w-full h-12 rounded cursor-pointer" />
          <div className="mono text-sm uppercase">{base}</div>
          <Button variant="outline" className="w-full" onClick={() => pushClipboard(palette.map((c) => `--c-${c.name}: ${c.hex};`).join("\n"))}>
            Copy as CSS variables
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {palette.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  const onWhite = contrast(hex, "#ffffff");
  const onBlack = contrast(hex, "#000000");
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <div className="h-32 flex items-end p-3" style={{ background: hex }}>
        <div className="text-xs px-2 py-1 rounded bg-black/40 text-white mono">{hex}</div>
      </div>
      <div className="p-3 text-sm">
        <div className="text-xs font-semibold uppercase text-muted-foreground">{name}</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Badge text="White Aa" bg={hex} fg="#ffffff" ratio={onWhite} />
          <Badge text="Black Aa" bg={hex} fg="#000000" ratio={onBlack} />
        </div>
      </div>
    </div>
  );
}

function Badge({ text, bg, fg, ratio }: { text: string; bg: string; fg: string; ratio: number }) {
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  return (
    <div className="rounded p-2 text-xs flex flex-col items-start gap-1" style={{ background: bg, color: fg }}>
      <span className="font-semibold">{text}</span>
      <span className="text-[10px] px-1 rounded" style={{ background: aa ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)", color: "white" }}>
        {ratio.toFixed(2)} · {aaa ? "AAA" : aa ? "AA" : "FAIL"}
      </span>
    </div>
  );
}

function generate(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return [
    { name: "base", hex },
    { name: "complement", hex: hslToHex((h + 180) % 360, s, l) },
    { name: "analog-1", hex: hslToHex((h + 30) % 360, s, l) },
    { name: "analog-2", hex: hslToHex((h - 30 + 360) % 360, s, l) },
    { name: "triadic-1", hex: hslToHex((h + 120) % 360, s, l) },
    { name: "triadic-2", hex: hslToHex((h + 240) % 360, s, l) },
  ];
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255,
    g = parseInt(hex.slice(3, 5), 16) / 255,
    b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  function f(n: number) {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

function lum(hex: string) {
  const c = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((h) => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrast(a: string, b: string) {
  const la = lum(a), lb = lum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
