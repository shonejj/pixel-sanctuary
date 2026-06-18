import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Download, RefreshCw, Video, Square, Image as ImageIcon } from "lucide-react";
import { downloadBlob } from "../AppShell";

export function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [shots, setShots] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [filter, setFilter] = useState("none");
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start(face: "user" | "environment" = facing) {
    setErr(null);
    try {
      stream?.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face }, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e: any) {
      setErr(e?.message || "Camera access denied");
    }
  }
  useEffect(() => { start(); return () => stream?.getTracks().forEach((t) => t.stop()); /* eslint-disable-next-line */ }, []);

  function snap() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = filter;
    ctx.drawImage(v, 0, 0);
    setShots((prev) => [c.toDataURL("image/png"), ...prev].slice(0, 24));
  }

  function toggleRec() {
    if (!stream) return;
    if (recording) { recRef.current?.stop(); return; }
    chunksRef.current = [];
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      downloadBlob(new Blob(chunksRef.current, { type: "video/webm" }), `recording-${Date.now()}.webm`);
      setRecording(false);
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b px-3 py-2 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={snap} disabled={!stream}><Camera size={14} className="mr-1"/>Snap</Button>
        <Button size="sm" variant={recording ? "destructive" : "outline"} onClick={toggleRec} disabled={!stream}>
          {recording ? <><Square size={14} className="mr-1"/>Stop</> : <><Video size={14} className="mr-1"/>Record</>}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { const n = facing === "user" ? "environment" : "user"; setFacing(n); start(n); }}>
          <RefreshCw size={14} className="mr-1"/>Flip
        </Button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-xs border rounded px-2 py-1 bg-card">
          <option value="none">No filter</option>
          <option value="grayscale(1)">B&amp;W</option>
          <option value="sepia(1)">Sepia</option>
          <option value="saturate(2) contrast(1.2)">Vivid</option>
          <option value="invert(1)">Invert</option>
          <option value="blur(2px)">Blur</option>
          <option value="hue-rotate(180deg)">Hue</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{shots.length} shots</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {err ? <div className="text-white p-6 text-center"><Camera size={48} className="mx-auto mb-2 opacity-50"/><div>{err}</div><div className="text-xs opacity-60 mt-1">Allow camera access in your browser.</div></div>
            : <video ref={videoRef} autoPlay playsInline muted style={{ filter, maxHeight: "100%", maxWidth: "100%" }} className="object-contain"/>}
          <canvas ref={canvasRef} hidden/>
        </div>
        {shots.length > 0 && (
          <div className="w-40 border-l overflow-auto scrollbar-thin p-2 space-y-2 bg-card">
            {shots.map((s, i) => (
              <div key={i} className="relative group">
                <img src={s} alt="" className="w-full rounded border"/>
                <button onClick={() => { const a = document.createElement("a"); a.href = s; a.download = `shot-${i}.png`; a.click(); }}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded opacity-0 group-hover:opacity-100">
                  <Download size={11}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
