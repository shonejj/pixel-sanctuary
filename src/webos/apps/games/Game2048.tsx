import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

type Grid = number[][];
const N = 4;
const empty = (): Grid => Array.from({ length: N }, () => Array(N).fill(0));

function addTile(g: Grid): Grid {
  const empties: [number, number][] = [];
  g.forEach((r, i) => r.forEach((v, j) => v === 0 && empties.push([i, j])));
  if (!empties.length) return g;
  const [i, j] = empties[Math.floor(Math.random() * empties.length)];
  const ng = g.map(r => r.slice());
  ng[i][j] = Math.random() < 0.9 ? 2 : 4;
  return ng;
}
function slide(row: number[]): [number[], number] {
  const arr = row.filter(x => x);
  let gained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; gained += arr[i]; arr.splice(i + 1, 1); }
  }
  while (arr.length < N) arr.push(0);
  return [arr, gained];
}
function rotate(g: Grid): Grid { return g[0].map((_, i) => g.map(r => r[i]).reverse()); }
function move(g: Grid, dir: "l" | "r" | "u" | "d"): [Grid, number, boolean] {
  let rotations = dir === "l" ? 0 : dir === "u" ? 1 : dir === "r" ? 2 : 3;
  let ng = g.map(r => r.slice());
  for (let i = 0; i < rotations; i++) ng = rotate(ng);
  let total = 0;
  ng = ng.map(r => { const [s, gained] = slide(r); total += gained; return s; });
  for (let i = 0; i < (4 - rotations) % 4; i++) ng = rotate(ng);
  const moved = JSON.stringify(ng) !== JSON.stringify(g);
  return [ng, total, moved];
}

const COLORS: Record<number, string> = {
  0: "bg-muted", 2: "bg-amber-100 text-amber-900", 4: "bg-amber-200 text-amber-900",
  8: "bg-orange-300 text-white", 16: "bg-orange-400 text-white", 32: "bg-orange-500 text-white",
  64: "bg-red-500 text-white", 128: "bg-yellow-400 text-white", 256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white", 1024: "bg-purple-500 text-white", 2048: "bg-purple-600 text-white",
};

export function Game2048() {
  const [g, setG] = useState<Grid>(() => addTile(addTile(empty())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => +(localStorage.getItem("2048-best") || 0));
  const ref = useRef(g);
  ref.current = g;

  useEffect(() => {
    function k(e: KeyboardEvent) {
      const m: any = { ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", ArrowDown: "d", a: "l", d: "r", w: "u", s: "d" };
      const dir = m[e.key];
      if (!dir) return;
      e.preventDefault();
      const [ng, gained, moved] = move(ref.current, dir);
      if (moved) { const next = addTile(ng); setG(next); setScore(s => { const ns = s + gained; if (ns > best) { setBest(ns); localStorage.setItem("2048-best", String(ns)); } return ns; }); }
    }
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [best]);

  function reset() { setG(addTile(addTile(empty()))); setScore(0); }

  return (
    <div className="p-4 h-full flex flex-col items-center gap-3">
      <div className="flex justify-between w-full max-w-md">
        <div className="flex gap-3">
          <div className="bg-muted rounded p-2 text-center text-xs"><div className="text-muted-foreground">Score</div><div className="font-bold text-base">{score}</div></div>
          <div className="bg-muted rounded p-2 text-center text-xs"><div className="text-muted-foreground">Best</div><div className="font-bold text-base">{best}</div></div>
        </div>
        <Button size="sm" variant="outline" onClick={reset}>New Game</Button>
      </div>
      <div className="bg-muted/60 rounded-xl p-2 grid gap-2" style={{ gridTemplateColumns: "repeat(4,1fr)", width: "min(420px,90vw)", aspectRatio: "1" }}>
        {g.flat().map((v, i) => (
          <div key={i} className={`rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold ${COLORS[v] || "bg-purple-700 text-white"}`}>
            {v || ""}
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Arrows / WASD to merge</div>
    </div>
  );
}
