import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const ref = useRef<number | null>(null);
  const start = useRef(0);

  useEffect(() => {
    if (running) {
      start.current = Date.now() - time;
      ref.current = window.setInterval(() => setTime(Date.now() - start.current), 31);
    } else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const fmt = (ms: number) => {
    const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000), c = Math.floor((ms%1000)/10);
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(c).padStart(2,"0")}`;
  };

  return (
    <div className="flex flex-col h-full p-6 bg-background">
      <div className="text-7xl font-bold mono text-center my-8 tabular-nums">{fmt(time)}</div>
      <div className="flex justify-center gap-2 mb-6">
        <Button size="lg" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</Button>
        <Button size="lg" variant="outline" onClick={() => running ? setLaps([time, ...laps]) : (setTime(0), setLaps([]))}>{running ? "Lap" : "Reset"}</Button>
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {laps.map((l, i) => (
          <div key={i} className="flex justify-between p-2 border-b text-sm mono">
            <span>Lap {laps.length - i}</span><span>{fmt(l)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
