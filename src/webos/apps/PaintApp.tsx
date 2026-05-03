import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "../AppShell";
import { Eraser, Download } from "lucide-react";

export function PaintApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#6366f1");
  const [size, setSize] = useState(4);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,c.width,c.height);
  }, []);

  function pos(e: any) {
    const r = ref.current!.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }
  function down(e: any) { drawing.current = true; const ctx = ref.current!.getContext("2d")!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
  function move(e: any) {
    if (!drawing.current) return; e.preventDefault();
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  function up() { drawing.current = false; }
  function clear() { const c = ref.current!; const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0,0,c.width,c.height); }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b p-2 flex gap-2 items-center flex-wrap">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer" />
        <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} />
        <span className="text-xs mono w-8">{size}px</span>
        <Button size="sm" variant="outline" onClick={clear}><Eraser size={14} className="mr-1"/>Clear</Button>
        <Button size="sm" onClick={() => ref.current?.toBlob(b => b && downloadBlob(b, "drawing.png"))}><Download size={14} className="mr-1"/>Save</Button>
      </div>
      <canvas ref={ref} className="flex-1 touch-none cursor-crosshair" onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up} />
    </div>
  );
}
