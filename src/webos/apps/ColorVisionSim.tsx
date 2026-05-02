import { useEffect, useRef, useState } from "react";
import { AppShell, downloadBlob } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const TYPES: { name: string; matrix: number[] }[] = [
  { name: "Normal", matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
  { name: "Protanopia", matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758] },
  { name: "Deuteranopia", matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7] },
  { name: "Tritanopia", matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525] },
  { name: "Protanomaly", matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875] },
  { name: "Deuteranomaly", matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858] },
  { name: "Tritanomaly", matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817] },
  { name: "Achromatopsia", matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114] },
];

export function ColorVisionSim() {
  const [src, setSrc] = useState<string | null>(null);
  const [type, setType] = useState(TYPES[1]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current!;
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const m = type.matrix;
      for (let i = 0; i < d.data.length; i += 4) {
        const r = d.data[i], g = d.data[i + 1], b = d.data[i + 2];
        d.data[i] = clamp(m[0] * r + m[1] * g + m[2] * b);
        d.data[i + 1] = clamp(m[3] * r + m[4] * g + m[5] * b);
        d.data[i + 2] = clamp(m[6] * r + m[7] * g + m[8] * b);
      }
      ctx.putImageData(d, 0, 0);
    };
    img.src = src;
  }, [src, type]);

  function download() {
    canvasRef.current?.toBlob((b) => b && downloadBlob(b, `simulated-${type.name}.png`));
  }

  return (
    <AppShell>
      <div className="p-6 space-y-3 h-full flex flex-col">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t.name} onClick={() => setType(t)} className={`px-3 py-1 rounded text-sm border ${type.name === t.name ? "bg-primary text-primary-foreground" : "bg-card"}`}>{t.name}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3 flex-1 overflow-auto">
          <div>
            {!src ? (
              <label className="border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer">
                <Upload size={28} />
                <div className="mt-2 text-sm text-muted-foreground">Drop or click to upload an image</div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSrc(URL.createObjectURL(e.target.files[0]))} />
              </label>
            ) : (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Original</div>
                <img src={src} className="w-full rounded border" alt="" />
              </div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Simulated: {type.name}</div>
            <canvas ref={canvasRef} className="w-full rounded border" />
            {src && <Button onClick={download} className="mt-2">Download simulated</Button>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function clamp(v: number) { return Math.max(0, Math.min(255, v)); }
