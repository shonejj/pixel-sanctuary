import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export function Pomodoro() {
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const durations = { work: 25*60, short: 5*60, long: 15*60 };
  const [left, setLeft] = useState(durations.work);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => { setLeft(durations[mode]); setRunning(false); }, [mode]);
  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => setLeft(l => {
      if (l <= 1) { setRunning(false); try { new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play(); } catch {}; return 0; }
      return l - 1;
    }), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const min = String(Math.floor(left/60)).padStart(2,"0");
  const sec = String(left%60).padStart(2,"0");
  const pct = (durations[mode] - left) / durations[mode] * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-primary/10 to-accent/10 p-6">
      <div className="flex gap-2 mb-8">
        {(["work","short","long"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${mode === m ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
            {m === "work" ? "Focus" : m === "short" ? "Short break" : "Long break"}
          </button>
        ))}
      </div>
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90">
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted opacity-30" />
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={753.98} strokeDashoffset={753.98 - (753.98 * pct) / 100} className="text-primary transition-all" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold mono">{min}:{sec}</div>
      </div>
      <div className="flex gap-2 mt-8">
        <Button size="lg" onClick={() => setRunning(!running)}>{running ? <><Pause className="mr-2" size={16}/>Pause</> : <><Play className="mr-2" size={16}/>Start</>}</Button>
        <Button size="lg" variant="outline" onClick={() => { setRunning(false); setLeft(durations[mode]); }}><RotateCcw size={16}/></Button>
      </div>
    </div>
  );
}
