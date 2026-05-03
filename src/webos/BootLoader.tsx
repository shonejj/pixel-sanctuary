import { useEffect, useState } from "react";

export function BootLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing kernel…");
  useEffect(() => {
    const stages = [
      [10, "Mounting virtual filesystem…"],
      [25, "Loading window manager…"],
      [45, "Registering applications…"],
      [65, "Hydrating user preferences…"],
      [82, "Starting desktop shell…"],
      [100, "Welcome"],
    ] as const;
    let i = 0;
    const t = setInterval(() => {
      if (i >= stages.length) { clearInterval(t); setTimeout(onDone, 350); return; }
      const [p, s] = stages[i++];
      setProgress(p); setStage(s);
    }, 280);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black text-white fade-in">
      <div className="boot-pulse text-7xl font-bold tracking-tight bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
        ◉ WebOS
      </div>
      <div className="mt-6 text-xs uppercase tracking-[0.3em] text-white/60">{stage}</div>
      <div className="mt-8 w-72 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 text-[10px] text-white/40 mono">{progress}%</div>
      <div className="absolute bottom-6 text-[10px] text-white/40 mono">private · offline · zero servers</div>
    </div>
  );
}
