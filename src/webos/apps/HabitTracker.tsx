import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Flame } from "lucide-react";

type Habit = { id: string; name: string; days: Record<string, boolean> };
const KEY = "webos-habits";
const today = () => new Date().toISOString().slice(0, 10);
function lastN(n: number) { const out: string[] = []; for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push(d.toISOString().slice(0, 10)); } return out; }
function streak(h: Habit) { let s = 0; const d = new Date(); while (h.days[d.toISOString().slice(0, 10)]) { s++; d.setDate(d.getDate() - 1); } return s; }

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } });
  const [name, setName] = useState("");
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(habits)); }, [habits]);
  const days = lastN(14);

  function add() { if (!name.trim()) return; setHabits([...habits, { id: Math.random().toString(36).slice(2), name: name.trim(), days: {} }]); setName(""); }
  function toggle(id: string, d: string) { setHabits(habits.map(h => h.id === id ? { ...h, days: { ...h.days, [d]: !h.days[d] } } : h)); }
  function del(id: string) { setHabits(habits.filter(h => h.id !== id)); }

  return (
    <div className="p-4 space-y-3 h-full overflow-auto">
      <h2 className="font-bold text-lg">Habits</h2>
      <div className="flex gap-2"><Input value={name} onChange={e => setName(e.target.value)} placeholder="New habit (e.g. Read 20 min)" onKeyDown={e => e.key === "Enter" && add()} /><Button onClick={add}><Plus size={14}/></Button></div>
      <div className="space-y-2">
        {habits.length === 0 && <div className="text-sm text-muted-foreground">No habits yet. Add one to start tracking.</div>}
        {habits.map(h => (
          <div key={h.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium flex items-center gap-2">{h.name} <span className="text-xs flex items-center gap-0.5 text-orange-500"><Flame size={12}/>{streak(h)}</span></div>
              <Button size="sm" variant="ghost" onClick={() => del(h.id)}><Trash2 size={14}/></Button>
            </div>
            <div className="flex gap-1">
              {days.map(d => (
                <button key={d} onClick={() => toggle(h.id, d)} title={d} className={`flex-1 h-8 rounded text-[10px] flex flex-col items-center justify-center ${h.days[d] ? "bg-emerald-500 text-white" : "bg-muted hover:bg-accent"} ${d === today() ? "ring-2 ring-primary" : ""}`}>
                  {d.slice(8)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
