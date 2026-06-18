import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Square, Download, Trash2 } from "lucide-react";
import { downloadBlob } from "../AppShell";

export function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [clips, setClips] = useState<{ url: string; blob: Blob; ts: number }[]>([]);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    setErr(null);
    try {
      // @ts-ignore
      const s: MediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const rec = new MediaRecorder(s, { mimeType: "video/webm" });
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setClips((c) => [{ url: URL.createObjectURL(blob), blob, ts: Date.now() }, ...c]);
        s.getTracks().forEach((t) => t.stop());
      };
      s.getVideoTracks()[0].addEventListener("ended", () => { rec.stop(); setRecording(false); });
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e: any) { setErr(e.message); }
  }
  function stop() { recRef.current?.stop(); setRecording(false); }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b flex items-center gap-3">
        <Button onClick={recording ? stop : start} variant={recording ? "destructive" : "default"}>
          {recording ? <><Square size={14} className="mr-1"/>Stop</> : <><Monitor size={14} className="mr-1"/>Record screen</>}
        </Button>
        <span className="text-xs text-muted-foreground">Captures screen / window / tab to WebM</span>
        {err && <span className="text-xs text-red-500 ml-auto">{err}</span>}
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2 scrollbar-thin">
        {clips.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">No recordings yet.</div>}
        {clips.map((c) => (
          <div key={c.ts} className="border rounded-lg p-3 bg-card">
            <video src={c.url} controls className="w-full rounded mb-2"/>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => downloadBlob(c.blob, `screen-${c.ts}.webm`)}><Download size={12} className="mr-1"/>Download</Button>
              <Button size="sm" variant="ghost" onClick={() => setClips((cs) => cs.filter((x) => x.ts !== c.ts))}><Trash2 size={12}/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
