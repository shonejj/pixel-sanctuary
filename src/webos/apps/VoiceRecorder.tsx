import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Download, Trash2, Play } from "lucide-react";
import { downloadBlob } from "../AppShell";

export function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState<{ url: string; blob: Blob; ts: number; dur: number }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const rafRef = useRef<number>();

  async function start() {
    setErr(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(s);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setClips((c) => [{ url: URL.createObjectURL(blob), blob, ts: Date.now(), dur: (Date.now() - startedRef.current) / 1000 }, ...c]);
        s.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(rafRef.current!);
        setLevel(0);
      };
      // VU meter
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(s);
      const an = ctx.createAnalyser(); an.fftSize = 256;
      src.connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => { an.getByteFrequencyData(buf); setLevel(buf.reduce((a, b) => a + b, 0) / buf.length / 255); rafRef.current = requestAnimationFrame(tick); };
      tick();
      startedRef.current = Date.now();
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e: any) { setErr(e.message || "Mic blocked"); }
  }
  function stop() { recRef.current?.stop(); setRecording(false); }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b flex flex-col items-center gap-4 bg-gradient-to-br from-primary/5 to-pink-500/5">
        <div className="relative">
          <button onClick={recording ? stop : start}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition shadow-xl ${recording ? "bg-red-500" : "bg-primary hover:scale-105"}`}>
            {recording ? <Square size={36}/> : <Mic size={36}/>}
          </button>
          {recording && <div className="absolute inset-0 rounded-full border-4 border-red-400/60 animate-ping"/>}
        </div>
        <div className="w-48 h-2 bg-muted rounded overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${level * 100}%` }}/>
        </div>
        <div className="text-xs text-muted-foreground">{recording ? "Recording…" : "Tap mic to record"}</div>
        {err && <div className="text-xs text-red-500">{err}</div>}
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-2">
        {clips.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">No recordings yet.</div>}
        {clips.map((c, i) => (
          <div key={c.ts} className="border rounded-lg p-3 bg-card flex items-center gap-3">
            <Play size={16} className="text-primary"/>
            <div className="flex-1">
              <div className="text-xs font-medium">Clip {clips.length - i} · {c.dur.toFixed(1)}s</div>
              <audio src={c.url} controls className="w-full mt-1 h-8"/>
            </div>
            <Button size="sm" variant="outline" onClick={() => downloadBlob(c.blob, `recording-${c.ts}.webm`)}><Download size={12}/></Button>
            <Button size="sm" variant="ghost" onClick={() => setClips((cs) => cs.filter((x) => x.ts !== c.ts))}><Trash2 size={12}/></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
