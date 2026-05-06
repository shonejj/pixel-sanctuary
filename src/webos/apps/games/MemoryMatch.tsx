import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const EMOJI = ["🌸", "🌊", "🔥", "⭐", "🌙", "🍀", "🦋", "🍓", "🎈", "🎵", "🍕", "🚀"];

type Card = { id: number; v: string; flip: boolean; matched: boolean };
function deal(pairs: number): Card[] {
  const items = EMOJI.slice(0, pairs).flatMap((v, i) => [{ id: i * 2, v, flip: false, matched: false }, { id: i * 2 + 1, v, flip: false, matched: false }]);
  return items.sort(() => Math.random() - 0.5);
}

export function MemoryMatch() {
  const [pairs, setPairs] = useState(8);
  const [cards, setCards] = useState<Card[]>(() => deal(8));
  const [moves, setMoves] = useState(0);
  const [sel, setSel] = useState<number[]>([]);

  useEffect(() => {
    if (sel.length !== 2) return;
    const [a, b] = sel;
    const A = cards.find(c => c.id === a)!, B = cards.find(c => c.id === b)!;
    setMoves(m => m + 1);
    if (A.v === B.v) {
      setTimeout(() => { setCards(cs => cs.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c)); setSel([]); }, 350);
    } else {
      setTimeout(() => { setCards(cs => cs.map(c => c.id === a || c.id === b ? { ...c, flip: false } : c)); setSel([]); }, 750);
    }
  }, [sel, cards]);

  function flip(id: number) {
    if (sel.length === 2) return;
    const c = cards.find(x => x.id === id);
    if (!c || c.flip || c.matched) return;
    setCards(cs => cs.map(x => x.id === id ? { ...x, flip: true } : x));
    setSel(s => [...s, id]);
  }
  function reset(p = pairs) { setPairs(p); setCards(deal(p)); setMoves(0); setSel([]); }
  const won = cards.every(c => c.matched);
  const cols = pairs <= 6 ? 4 : pairs <= 10 ? 5 : 6;

  return (
    <div className="p-4 h-full flex flex-col items-center gap-3">
      <div className="flex gap-2 w-full max-w-md justify-between flex-wrap">
        <div className="flex gap-1">
          {[6, 8, 10, 12].map(p => <Button key={p} size="sm" variant={pairs === p ? "default" : "outline"} onClick={() => reset(p)}>{p} pairs</Button>)}
        </div>
        <div className="text-sm">Moves: <b>{moves}</b></div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, width: "min(500px,95vw)" }}>
        {cards.map(c => (
          <button key={c.id} onClick={() => flip(c.id)} className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${c.matched ? "bg-emerald-500/20 ring-2 ring-emerald-500" : c.flip ? "bg-primary/20" : "bg-card border hover:bg-accent"}`}>
            {(c.flip || c.matched) ? c.v : "?"}
          </button>
        ))}
      </div>
      {won && <div className="text-emerald-500 font-bold">You won in {moves} moves! <Button size="sm" className="ml-2" onClick={() => reset()}>Again</Button></div>}
    </div>
  );
}
