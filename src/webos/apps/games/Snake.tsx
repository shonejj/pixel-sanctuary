import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SIZE = 20;
type P = { x: number; y: number };
const eq = (a: P, b: P) => a.x === b.x && a.y === b.y;
const rand = () => ({ x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) });

export function Snake() {
  const [snake, setSnake] = useState<P[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<P>(rand());
  const [dir, setDir] = useState<P>({ x: 1, y: 0 });
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(140);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    function k(e: KeyboardEvent) {
      const d = dirRef.current;
      if ((e.key === "ArrowUp" || e.key === "w") && d.y !== 1) setDir({ x: 0, y: -1 });
      else if ((e.key === "ArrowDown" || e.key === "s") && d.y !== -1) setDir({ x: 0, y: 1 });
      else if ((e.key === "ArrowLeft" || e.key === "a") && d.x !== 1) setDir({ x: -1, y: 0 });
      else if ((e.key === "ArrowRight" || e.key === "d") && d.x !== -1) setDir({ x: 1, y: 0 });
    }
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    if (over) return;
    const t = setInterval(() => {
      setSnake(s => {
        const head = { x: s[0].x + dirRef.current.x, y: s[0].y + dirRef.current.y };
        if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE || s.some(p => eq(p, head))) {
          setOver(true);
          return s;
        }
        const ate = eq(head, food);
        if (ate) {
          setScore(x => x + 10);
          setFood(rand());
          setSpeed(sp => Math.max(60, sp - 3));
        }
        return [head, ...(ate ? s : s.slice(0, -1))];
      });
    }, speed);
    return () => clearInterval(t);
  }, [over, speed, food]);

  function reset() {
    setSnake([{ x: 10, y: 10 }]); setFood(rand()); setDir({ x: 1, y: 0 });
    setOver(false); setScore(0); setSpeed(140);
  }

  return (
    <div className="p-4 h-full flex flex-col items-center gap-3">
      <div className="flex justify-between w-full max-w-md">
        <div className="text-sm">Score: <span className="font-bold">{score}</span></div>
        <Button size="sm" variant="outline" onClick={reset}>Reset</Button>
      </div>
      <div className="grid bg-muted rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${SIZE},1fr)`, width: "min(420px,90vw)", aspectRatio: "1" }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const x = i % SIZE, y = Math.floor(i / SIZE);
          const isSnake = snake.some(p => p.x === x && p.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return <div key={i} className={`rounded-[2px] ${isFood ? "bg-red-500" : isHead ? "bg-primary" : isSnake ? "bg-primary/70" : "bg-background"}`} />;
        })}
      </div>
      {over && <div className="text-center"><div className="text-lg font-bold text-destructive">Game Over</div><Button size="sm" onClick={reset} className="mt-2">Play again</Button></div>}
      <div className="text-xs text-muted-foreground">Arrow keys / WASD to move</div>
    </div>
  );
}
