import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "../AppShell";

export function QrGenerator() {
  const [text, setText] = useState("https://lovable.dev");
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current && text) QRCode.toCanvas(ref.current, text, { width: 320, margin: 2 }); }, [text]);
  return (
    <div className="p-6 flex flex-col items-center gap-4 h-full bg-background">
      <h1 className="text-2xl font-bold">QR Code Generator</h1>
      <Input className="max-w-md" value={text} onChange={(e) => setText(e.target.value)} placeholder="Text or URL" />
      <div className="bg-white p-4 rounded-xl"><canvas ref={ref} /></div>
      <Button onClick={() => ref.current?.toBlob(b => b && downloadBlob(b, "qr.png"))}>Download PNG</Button>
    </div>
  );
}
