import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JsonFormatter() {
  const [src, setSrc] = useState(`{"hello":"world","nested":{"arr":[1,2,3]}}`);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    setErr("");
    try { setOut(JSON.stringify(JSON.parse(src), null, indent)); }
    catch (e: any) { setErr(e.message); setOut(""); }
  }
  function minify() {
    setErr("");
    try { setOut(JSON.stringify(JSON.parse(src))); }
    catch (e: any) { setErr(e.message); setOut(""); }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b p-2 flex gap-2 items-center">
        <Button size="sm" onClick={format}>Format</Button>
        <Button size="sm" variant="outline" onClick={minify}>Minify</Button>
        <Input type="number" className="w-20" value={indent} onChange={(e) => setIndent(+e.target.value)} />
        {err && <span className="text-destructive text-sm">{err}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
        <textarea value={src} onChange={(e) => setSrc(e.target.value)} className="p-3 mono text-xs bg-card border-r outline-none resize-none" />
        <textarea value={out} readOnly className="p-3 mono text-xs bg-background outline-none resize-none" />
      </div>
    </div>
  );
}
