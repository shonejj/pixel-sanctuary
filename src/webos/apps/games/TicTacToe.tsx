import { useState } from "react";
import { Button } from "@/components/ui/button";

type Cell = "X" | "O" | null;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b: Cell[]) { for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]]; return null; }

function bestMove(b: Cell[], me: "X" | "O"): number {
  const opp = me === "X" ? "O" : "X";
  function score(b: Cell[], turn: "X" | "O", depth: number): number {
    const w = winner(b);
    if (w === me) return 10 - depth;
    if (w === opp) return depth - 10;
    if (b.every(Boolean)) return 0;
    const scores = b.map((c, i) => {
      if (c) return turn === me ? -Infinity : Infinity;
      const nb = b.slice(); nb[i] = turn;
      return score(nb, turn === "X" ? "O" : "X", depth + 1);
    });
    return turn === me ? Math.max(...scores) : Math.min(...scores);
  }
  let best = -Infinity, idx = -1;
  b.forEach((c, i) => { if (c) return; const nb = b.slice(); nb[i] = me; const s = score(nb, me === "X" ? "O" : "X", 0); if (s > best) { best = s; idx = i; } });
  return idx;
}

export function TicTacToe() {
  const [b, setB] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [vsAI, setVsAI] = useState(true);
  const w = winner(b);
  const draw = !w && b.every(Boolean);

  function play(i: number) {
    if (b[i] || w) return;
    const nb = b.slice(); nb[i] = turn; setB(nb);
    const next = turn === "X" ? "O" : "X"; setTurn(next);
    if (vsAI && next === "O" && !winner(nb)) {
      setTimeout(() => {
        const m = bestMove(nb, "O");
        if (m >= 0) { const nb2 = nb.slice(); nb2[m] = "O"; setB(nb2); setTurn("X"); }
      }, 250);
    }
  }
  function reset() { setB(Array(9).fill(null)); setTurn("X"); }

  return (
    <div className="p-4 flex flex-col items-center gap-3 h-full">
      <div className="flex gap-2 items-center">
        <Button size="sm" variant={vsAI ? "default" : "outline"} onClick={() => { setVsAI(true); reset(); }}>Vs AI</Button>
        <Button size="sm" variant={!vsAI ? "default" : "outline"} onClick={() => { setVsAI(false); reset(); }}>2 Player</Button>
        <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
      </div>
      <div className="grid grid-cols-3 gap-2" style={{ width: "min(320px,80vw)" }}>
        {b.map((c, i) => (
          <button key={i} onClick={() => play(i)} className="aspect-square bg-card border-2 rounded-xl text-4xl font-bold hover:bg-accent flex items-center justify-center">
            <span className={c === "X" ? "text-primary" : "text-pink-500"}>{c}</span>
          </button>
        ))}
      </div>
      <div className="text-sm font-medium h-5">{w ? `${w} wins!` : draw ? "Draw" : `${turn}'s turn`}</div>
    </div>
  );
}
