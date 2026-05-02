import { useState } from "react";
import { AppShell, downloadBlob } from "../AppShell";
import { Button } from "@/components/ui/button";
import exifr from "exifr";
import { Upload, ShieldAlert } from "lucide-react";

export function MetadataScrubber() {
  const [src, setSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, any> | null>(null);
  const [name, setName] = useState("image");

  async function onFile(f: File) {
    setName(f.name.replace(/\.\w+$/, ""));
    const url = URL.createObjectURL(f);
    setSrc(url);
    try {
      const data = await exifr.parse(f, true);
      setMeta(data || {});
    } catch {
      setMeta({});
    }
  }

  function scrub() {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      c.toBlob((b) => b && downloadBlob(b, `${name}-clean.png`), "image/png");
    };
    img.src = src;
  }

  const hasGPS = meta && (meta.latitude || meta.GPSLatitude);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div>
          {!src ? (
            <label className="border-2 border-dashed border-border rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/30">
              <Upload size={32} className="text-muted-foreground" />
              <div className="mt-2 text-sm text-muted-foreground">Drop or click to choose an image</div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
          ) : (
            <div>
              <img src={src} alt="" className="w-full rounded-xl border border-border" />
              <div className="mt-2 flex gap-2">
                <Button onClick={scrub}>Scrub & download</Button>
                <Button variant="outline" onClick={() => { setSrc(null); setMeta(null); }}>Reset</Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-4 overflow-auto">
          <div className="text-sm font-semibold mb-2">Metadata</div>
          {hasGPS && (
            <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded p-2 text-sm flex items-center gap-2 mb-2">
              <ShieldAlert size={16} /> GPS coordinates detected — could reveal location.
            </div>
          )}
          {!meta ? (
            <div className="text-sm text-muted-foreground">No image yet.</div>
          ) : Object.keys(meta).length === 0 ? (
            <div className="text-sm text-muted-foreground">No metadata found.</div>
          ) : (
            <table className="text-xs w-full mono">
              <tbody>
                {Object.entries(meta).slice(0, 50).map(([k, v]) => (
                  <tr key={k} className="border-b border-border/50">
                    <td className="py-1 pr-3 text-muted-foreground">{k}</td>
                    <td className="py-1 break-all">{String(v).slice(0, 80)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
