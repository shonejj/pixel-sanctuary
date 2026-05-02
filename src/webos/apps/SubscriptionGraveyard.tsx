import { useEffect, useMemo, useState } from "react";
import { AppShell, useLocalStorage } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileDown } from "lucide-react";
import { notify } from "../kernel";
import jsPDF from "jspdf";

type Sub = {
  id: string;
  name: string;
  cost: number;
  cycle: "monthly" | "yearly" | "weekly";
  next: string;
  category: string;
  notes?: string;
};

const CATS = ["Streaming", "Productivity", "Cloud", "Fitness", "Gaming", "Other"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function SubscriptionGraveyard() {
  const [subs, setSubs] = useLocalStorage<Sub[]>("subs", [
    { id: "1", name: "Netflix", cost: 15.99, cycle: "monthly", next: nextDate(5), category: "Streaming" },
    { id: "2", name: "iCloud", cost: 2.99, cycle: "monthly", next: nextDate(20), category: "Cloud" },
    { id: "3", name: "GitHub Copilot", cost: 100, cycle: "yearly", next: nextDate(45), category: "Productivity" },
  ]);
  const [draft, setDraft] = useState<Sub>(emptySub());

  useEffect(() => {
    subs.forEach((s) => {
      const days = daysUntil(s.next);
      if (days >= 0 && days <= 3) notify("Renewal soon", `${s.name} renews in ${days} day(s)`);
    });
    // eslint-disable-next-line
  }, []);

  const monthlyTotal = useMemo(
    () => subs.reduce((sum, s) => sum + (s.cycle === "yearly" ? s.cost / 12 : s.cycle === "weekly" ? s.cost * 4.33 : s.cost), 0),
    [subs],
  );

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    subs.forEach((s) => {
      const v = s.cycle === "yearly" ? s.cost / 12 : s.cycle === "weekly" ? s.cost * 4.33 : s.cost;
      m[s.category] = (m[s.category] || 0) + v;
    });
    return m;
  }, [subs]);

  function exportEstate() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Digital Estate Plan", 20, 20);
    doc.setFontSize(11);
    doc.text("All active subscriptions and how to cancel each.", 20, 30);
    let y = 45;
    subs.forEach((s) => {
      doc.setFontSize(13);
      doc.text(`${s.name} — $${s.cost} ${s.cycle}`, 20, y);
      doc.setFontSize(10);
      doc.text(`Renews: ${s.next} · Category: ${s.category}`, 20, y + 6);
      doc.text(`How to cancel: visit account settings on the provider's website.`, 20, y + 12);
      y += 22;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("digital-estate-plan.pdf");
  }

  return (
    <AppShell>
      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Monthly burn</div>
              <div className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</div>
            </div>
            <Button onClick={exportEstate} variant="outline">
              <FileDown size={14} className="mr-2" /> Estate plan PDF
            </Button>
          </div>

          <div className="grid gap-2">
            {subs.map((s) => {
              const days = daysUntil(s.next);
              const color = days < 7 ? "bg-destructive" : days < 30 ? "bg-yellow-500" : "bg-emerald-500";
              return (
                <div key={s.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                  <div className={`w-2 h-12 rounded-full ${color}`} />
                  <div className="flex-1">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ${s.cost} {s.cycle} · {s.category} · renews in {days}d ({s.next})
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSubs(subs.filter((x) => x.id !== s.id))}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Spending by category</div>
            <div className="space-y-1">
              {Object.entries(byCat).map(([cat, val], i) => (
                <div key={cat} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="w-32">{cat}</span>
                  <div className="flex-1 h-2 bg-muted rounded">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${(val / monthlyTotal) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="tabular-nums w-16 text-right">${val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3 space-y-3 h-fit">
          <div className="font-semibold">Add subscription</div>
          <div>
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Cost</Label>
              <Input type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: +e.target.value })} />
            </div>
            <div>
              <Label>Cycle</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={draft.cycle}
                onChange={(e) => setDraft({ ...draft, cycle: e.target.value as any })}
              >
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Next renewal</Label>
            <Input type="date" value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })} />
          </div>
          <Button
            className="w-full"
            disabled={!draft.name}
            onClick={() => {
              setSubs([...subs, { ...draft, id: Math.random().toString(36).slice(2) }]);
              setDraft(emptySub());
            }}
          >
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function nextDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}
function daysUntil(iso: string) {
  const d = new Date(iso).getTime();
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
}
function emptySub(): Sub {
  return { id: "", name: "", cost: 9.99, cycle: "monthly", next: nextDate(30), category: "Other" };
}
