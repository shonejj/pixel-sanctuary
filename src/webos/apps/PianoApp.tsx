import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const TONES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const FREQ: Record<string, number> = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25 };

export function PianoApp() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [oct, setOct] = useState(0);

  function play(tone: string) {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = ctxRef.current;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = FREQ[tone] * Math.pow(2, oct);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.6);
  }

  useEffect(() => {
    const map: Record<string, string> = { a: "C4", s: "D4", d: "E4", f: "F4", g: "G4", h: "A4", j: "B4", k: "C5" };
    function k(e: KeyboardEvent) { const t = map[e.key.toLowerCase()]; if (t) play(t); }
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center gap-4">
      <div className="flex gap-2 items-center">
        <span className="text-sm">Octave:</span>
        <Button size="sm" variant="outline" onClick={() => setOct(o => Math.max(-2, o - 1))}>−</Button>
        <span className="font-bold">{oct >= 0 ? "+" : ""}{oct}</span>
        <Button size="sm" variant="outline" onClick={() => setOct(o => Math.min(2, o + 1))}>+</Button>
      </div>
      <div className="flex gap-1">
        {TONES.map((t, i) => (
          <button key={t} onMouseDown={() => play(t)} className="w-12 sm:w-14 h-44 bg-white border-2 border-gray-700 rounded-b-lg shadow-md hover:bg-gray-100 active:bg-gray-200 flex items-end justify-center pb-2 text-xs text-gray-700 font-medium">
            {t}<br/><span className="text-[10px] text-gray-400">{"asdfghjk"[i]}</span>
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">Use keys A S D F G H J K to play</div>
    </div>
  );
}
