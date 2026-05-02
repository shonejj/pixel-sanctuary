import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewAuthenticity() {
  const [text, setText] = useState(
    "★★★★★ Best product ever, life-changing!\n★★★★★ Amazing, life-changing product, you must buy!\n★ Garbage. Broke in 2 days.\n★★★★★ Life changing, must buy now!!\n★★★★ Pretty good overall.",
  );

  const result = useMemo(() => analyze(text), [text]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Paste reviews (one per line)</div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 min-h-[300px] mono text-xs" />
        </div>
        <div className="space-y-3">
          <div className="bg-card border rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Trust score</div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold" style={{ color: scoreColor(result.score) }}>
                {result.score}
              </div>
              <div className="text-sm text-muted-foreground mb-2">/ 100</div>
            </div>
            <div className="mt-2 h-2 bg-muted rounded">
              <div className="h-2 rounded transition-all" style={{ width: `${result.score}%`, background: scoreColor(result.score) }} />
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Stats</div>
            <ul className="text-sm space-y-1">
              <li>Total reviews: <b>{result.total}</b></li>
              <li>5★ ratio: <b>{(result.fiveRatio * 100).toFixed(0)}%</b></li>
              <li>1★ ratio: <b>{(result.oneRatio * 100).toFixed(0)}%</b></li>
              <li>Avg length: <b>{result.avgLen.toFixed(0)} chars</b></li>
              <li>Repeated phrases: <b>{result.repeats}</b></li>
            </ul>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Red flags</div>
            {result.flags.length === 0 ? (
              <div className="text-sm text-muted-foreground">No obvious red flags.</div>
            ) : (
              <ul className="text-sm list-disc list-inside text-destructive">
                {result.flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function analyze(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const total = lines.length || 1;
  const ratings = lines.map((l) => {
    const stars = (l.match(/★/g) || []).length;
    if (stars) return stars;
    const m = l.match(/(\d)\s*\/\s*5/);
    return m ? +m[1] : 0;
  });
  const five = ratings.filter((r) => r === 5).length;
  const one = ratings.filter((r) => r === 1).length;
  const avgLen = lines.reduce((s, l) => s + l.length, 0) / total;
  // repeated phrases (3+ words)
  const phrases: Record<string, number> = {};
  lines.forEach((l) => {
    const words = l.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const p = words.slice(i, i + 3).join(" ");
      if (p.length > 8) phrases[p] = (phrases[p] || 0) + 1;
    }
  });
  const repeats = Object.values(phrases).filter((v) => v >= 2).length;

  const flags: string[] = [];
  if (five / total > 0.85) flags.push(`Very high 5★ ratio (${((five / total) * 100).toFixed(0)}%) — possible review padding.`);
  if (one / total > 0.6) flags.push(`Heavy negative skew (${((one / total) * 100).toFixed(0)}% 1★).`);
  if (repeats >= 3) flags.push(`${repeats} repeated 3-word phrases — possible templated reviews.`);
  if (avgLen < 30) flags.push(`Very short reviews on average (${avgLen.toFixed(0)} chars).`);

  let score = 100;
  score -= flags.length * 18;
  score -= Math.max(0, five / total - 0.7) * 80;
  score = Math.max(5, Math.min(100, Math.round(score)));

  return { total, fiveRatio: five / total, oneRatio: one / total, avgLen, repeats, flags, score };
}

function scoreColor(s: number) {
  if (s >= 75) return "oklch(0.65 0.18 145)";
  if (s >= 50) return "oklch(0.75 0.17 75)";
  return "oklch(0.62 0.24 27)";
}
