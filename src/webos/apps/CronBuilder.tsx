import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pushClipboard } from "../kernel";

const PRESETS = [
  { name: "Every minute", expr: "* * * * *" },
  { name: "Every hour", expr: "0 * * * *" },
  { name: "Daily at midnight", expr: "0 0 * * *" },
  { name: "Every Monday 9 AM", expr: "0 9 * * 1" },
  { name: "Every 15 min", expr: "*/15 * * * *" },
  { name: "First day of month", expr: "0 0 1 * *" },
];

export function CronBuilder() {
  const [expr, setExpr] = useState("0 9 * * 1");
  const explanation = useMemo(() => explain(expr), [expr]);
  const next = useMemo(() => nextRuns(expr, 5), [expr]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-[1fr_280px] gap-4 h-full">
        <div className="space-y-3">
          <Input value={expr} onChange={(e) => setExpr(e.target.value)} className="mono text-xl text-center py-6" />
          <div className="bg-card border rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Plain English</div>
            <div className="text-base">{explanation}</div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Next 5 runs</div>
            <ul className="text-sm space-y-1 mono">
              {next.map((d, i) => <li key={i}>{d.toLocaleString()}</li>)}
            </ul>
          </div>
          <Button variant="outline" onClick={() => pushClipboard(expr)}>Copy expression</Button>
        </div>
        <div className="bg-card border rounded-xl p-3 space-y-1">
          <div className="text-sm font-semibold mb-2">Presets</div>
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => setExpr(p.expr)} className="w-full text-left text-sm hover:bg-accent rounded px-2 py-1">
              <div>{p.name}</div>
              <div className="mono text-xs text-muted-foreground">{p.expr}</div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function explain(expr: string) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Expects 5 fields: minute hour day month weekday";
  const [m, h, dom, mo, dow] = parts;
  const segs: string[] = [];
  if (m === "*") segs.push("every minute");
  else if (m.startsWith("*/")) segs.push(`every ${m.slice(2)} minutes`);
  else segs.push(`at minute ${m}`);
  if (h !== "*") segs.push(`hour ${h}`);
  if (dom !== "*") segs.push(`day-of-month ${dom}`);
  if (mo !== "*") segs.push(`month ${mo}`);
  if (dow !== "*") segs.push(`weekday ${dow}`);
  return segs.join(", ");
}

function nextRuns(expr: string, n: number) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [mF, hF, domF, moF, dowF] = parts;
  function match(field: string, val: number, max: number) {
    if (field === "*") return true;
    if (field.startsWith("*/")) return val % +field.slice(2) === 0;
    return field.split(",").some((p) => {
      if (p.includes("-")) {
        const [a, b] = p.split("-").map(Number);
        return val >= a && val <= b;
      }
      return +p === val;
    });
  }
  const out: Date[] = [];
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < 60 * 24 * 366 && out.length < n; i++) {
    if (
      match(mF, d.getMinutes(), 59) &&
      match(hF, d.getHours(), 23) &&
      match(domF, d.getDate(), 31) &&
      match(moF, d.getMonth() + 1, 12) &&
      match(dowF, d.getDay(), 6)
    ) {
      out.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return out;
}
