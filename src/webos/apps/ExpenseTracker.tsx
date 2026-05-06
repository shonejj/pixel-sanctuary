import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

type Tx = { id: string; date: string; desc: string; amount: number; cat: string };
const KEY = "webos-expenses";
const CATS = ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Other"];

export function ExpenseTracker() {
  const [txs, setTxs] = useState<Tx[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } });
  const [desc, setDesc] = useState(""); const [amt, setAmt] = useState(""); const [cat, setCat] = useState(CATS[0]);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(txs)); }, [txs]);

  function add() {
    const a = parseFloat(amt); if (!desc || isNaN(a)) return;
    setTxs([{ id: Math.random().toString(36).slice(2), date: new Date().toISOString().slice(0, 10), desc, amount: a, cat }, ...txs]);
    setDesc(""); setAmt("");
  }
  const total = txs.reduce((s, t) => s + t.amount, 0);
  const byCat = CATS.map(c => ({ c, v: txs.filter(t => t.cat === c).reduce((s, t) => s + t.amount, 0) })).filter(x => x.v > 0);

  return (
    <div className="p-4 h-full overflow-auto space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">Expenses</h2>
        <div className="text-right"><div className="text-xs text-muted-foreground">Total</div><div className="text-xl font-bold">${total.toFixed(2)}</div></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border rounded-lg p-3 bg-muted/30">
        <Input className="sm:col-span-5" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <Input className="sm:col-span-3" placeholder="Amount" type="number" value={amt} onChange={e => setAmt(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <select className="sm:col-span-3 bg-card border rounded px-2 text-sm" value={cat} onChange={e => setCat(e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
        <Button className="sm:col-span-1" onClick={add}><Plus size={14}/></Button>
      </div>
      {byCat.length > 0 && (
        <div className="border rounded-lg p-3 space-y-1.5">
          {byCat.map(({ c, v }) => (
            <div key={c} className="text-xs">
              <div className="flex justify-between mb-0.5"><span>{c}</span><span className="font-medium">${v.toFixed(2)}</span></div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(v / total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1">
        {txs.map(t => (
          <div key={t.id} className="flex items-center gap-2 p-2 border rounded text-sm">
            <div className="flex-1"><div className="font-medium">{t.desc}</div><div className="text-xs text-muted-foreground">{t.date} · {t.cat}</div></div>
            <div className="font-bold">${t.amount.toFixed(2)}</div>
            <Button size="sm" variant="ghost" onClick={() => setTxs(txs.filter(x => x.id !== t.id))}><Trash2 size={14}/></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
