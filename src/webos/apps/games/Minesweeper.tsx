import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Bomb } from "lucide-react";

type Cell = { mine: boolean; revealed: boolean; flag: boolean; n: number };
type Diff = { name: string; size: number; mines: number };
const DIFFS: Diff[] = [
  { name: "Easy", size: 9, mines: 10 },
  { name: "Medium", size: 12, mines: 25 },
  { name: "Hard", size: 16, mines: 50 },
];

function build(size: number, mines: number): Cell[][] {
  const g: Cell[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ mine: false, revealed: false, flag: false, n: 0 })));
  let m = 0;
  while (m < mines) {
    const x = Math.floor(Math.random() * size), y = Math.floor(Math.random() * size);
    if (!g[y][x].mine) { g[y][x].mine = true; m++; }
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (g[y][x].mine) continue;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < size && ny < size && g[ny][nx].mine) n++;
    }
    g[y][x].n = n;
  }
  return g;
}

export function Minesweeper() {
  const [diff, setDiff] = useState<Diff>(DIFFS[0]);
  const [g, setG] = useState<Cell[][]>(() => build(diff.size, diff.mines));
  const [over, setOver] = useState<null | "win" | "lose">(null);

  function reveal(x: number, y: number) {
    if (over || g[y][x].revealed || g[y][x].flag) return;
    const ng = g.map(r => r.map(c => ({ ...c })));
    const stack: [number, number][] = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cy < 0 || cx >= diff.size || cy >= diff.size) continue;
      const c = ng[cy][cx];
      if (c.revealed || c.flag) continue;
      c.revealed = true;
      if (c.n === 0 && !c.mine) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) stack.push([cx + dx, cy + dy]);
      }
    }
    if (ng[y][x].mine) {
      ng.forEach(r => r.forEach(c => { if (c.mine) c.revealed = true; }));
      setOver("lose");
    } else {
      const safe = ng.flat().filter(c => !c.mine);
      if (safe.every(c => c.revealed)) setOver("win");
    }
    setG(ng);
  }
  function flag(e: React.MouseEvent, x: number, y: number) {
    e.preventDefault();
    if (over || g[y][x].revealed) return;
    const ng = g.map(r => r.map(c => ({ ...c })));
    ng[y][x].flag = !ng[y][x].flag;
    setG(ng);
  }
  function reset(d?: Diff) {
    const dd = d || diff;
    setDiff(dd); setG(build(dd.size, dd.mines)); setOver(null);
  }

  const flags = g.flat().filter(c => c.flag).length;

  return (
    <div className="p-4 h-full flex flex-col items-center gap-3 overflow-auto">
      <div className="flex flex-wrap items-center gap-2 w-full justify-between max-w-xl">
        <div className="flex gap-1">
          {DIFFS.map(d => <Button key={d.name} size="sm" variant={diff.name === d.name ? "default" : "outline"} onClick={() => reset(d)}>{d.name}</Button>)}
        </div>
        <div className="text-sm flex items-center gap-3"><span><Flag className="inline mr-1" size={14}/>{flags}/{diff.mines}</span>{over === "win" && <span className="text-emerald-500 font-bold">Won!</span>}{over === "lose" && <span className="text-destructive font-bold">Boom!</span>}</div>
        <Button size="sm" variant="outline" onClick={() => reset()}>Reset</Button>
      </div>
      <div className="grid gap-px bg-border p-px rounded" style={{ gridTemplateColumns: `repeat(${diff.size},minmax(0,1fr))`, width: "min(560px,95vw)", aspectRatio: "1" }}>
        {g.map((row, y) => row.map((c, x) => (
          <button key={`${x},${y}`} onClick={() => reveal(x, y)} onContextMenu={(e) => flag(e, x, y)}
            className={`flex items-center justify-center text-xs sm:text-sm font-bold ${c.revealed ? "bg-muted" : "bg-card hover:bg-accent"}`}>
            {c.revealed ? (c.mine ? <Bomb size={12}/> : c.n > 0 ? <span style={{ color: ["", "#3b82f6", "#10b981", "#ef4444", "#7c3aed", "#f59e0b", "#06b6d4", "#1e293b", "#dc2626"][c.n] }}>{c.n}</span> : "") : c.flag ? <Flag size={10} className="text-red-500"/> : ""}
          </button>
        )))}
      </div>
      <div className="text-xs text-muted-foreground">Left click reveal · Right click flag</div>
    </div>
  );
}
