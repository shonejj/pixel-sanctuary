import { useState } from "react";
import { AppShell } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Mate = { id: string; name: string; sqft: number; closet: number; windows: number; bath: boolean; light: number };

export function RentSplit() {
  const [rent, setRent] = useState(3000);
  const [common, setCommon] = useState(400);
  const [mates, setMates] = useState<Mate[]>([
    { id: "1", name: "Alex", sqft: 150, closet: 6, windows: 2, bath: true, light: 8 },
    { id: "2", name: "Jordan", sqft: 110, closet: 4, windows: 1, bath: false, light: 5 },
    { id: "3", name: "Sam", sqft: 90, closet: 2, windows: 1, bath: false, light: 3 },
  ]);

  function score(m: Mate) {
    return m.sqft * 1 + m.closet * 5 + m.windows * 8 + (m.bath ? 80 : 0) + m.light * 3;
  }
  const total = mates.reduce((s, m) => s + score(m), 0);
  const privateRent = rent - common;
  const commonShare = common / Math.max(1, mates.length);

  return (
    <AppShell>
      <div className="p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Total monthly rent ($)</Label>
            <Input type="number" value={rent} onChange={(e) => setRent(+e.target.value)} />
          </div>
          <div>
            <Label>Common areas value ($, split equally)</Label>
            <Input type="number" value={common} onChange={(e) => setCommon(+e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() =>
                setMates([
                  ...mates,
                  { id: Math.random().toString(36).slice(2), name: "", sqft: 100, closet: 3, windows: 1, bath: false, light: 5 },
                ])
              }
            >
              <Plus size={14} className="mr-1" /> Add roommate
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {mates.map((m, i) => {
            const s = score(m);
            const fair = (s / total) * privateRent + commonShare;
            return (
              <div key={m.id} className="bg-card border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    className="w-40"
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => setMates(mates.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  />
                  <div className="ml-auto text-right">
                    <div className="text-xs text-muted-foreground">Fair share</div>
                    <div className="text-2xl font-bold text-primary">${fair.toFixed(2)}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setMates(mates.filter((_, j) => j !== i))}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid md:grid-cols-5 gap-3 text-sm">
                  <Slider label={`Sq ft: ${m.sqft}`} max={500} value={m.sqft} onChange={(v) => upd(i, "sqft", v)} />
                  <Slider label={`Closet: ${m.closet}`} max={10} value={m.closet} onChange={(v) => upd(i, "closet", v)} />
                  <Slider label={`Windows: ${m.windows}`} max={5} value={m.windows} onChange={(v) => upd(i, "windows", v)} />
                  <Slider label={`Light: ${m.light}/10`} max={10} value={m.light} onChange={(v) => upd(i, "light", v)} />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={m.bath} onChange={(e) => upd(i, "bath", e.target.checked)} />
                    Private bath
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );

  function upd(idx: number, key: keyof Mate, val: any) {
    setMates(mates.map((x, j) => (j === idx ? { ...x, [key]: val } : x)));
  }
}

function Slider({ label, max, value, onChange }: { label: string; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-xs">{label}</div>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full" />
    </div>
  );
}
