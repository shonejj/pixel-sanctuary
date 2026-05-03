import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { pushClipboard, notify } from "../kernel";

export function PasswordGen() {
  const [length, setLength] = useState(20);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pwd, setPwd] = useState("");

  function gen() {
    let chars = "";
    if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (nums) chars += "0123456789";
    if (syms) chars += "!@#$%^&*()_+-=[]{}<>?";
    if (!chars) return;
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPwd(Array.from(arr).map(n => chars[n % chars.length]).join(""));
  }

  const score = Math.min(100, length * 4 + (upper?10:0)+(lower?10:0)+(nums?10:0)+(syms?15:0));

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-background h-full">
      <h1 className="text-2xl font-bold">Password Generator</h1>
      <div className="flex gap-2">
        <Input value={pwd} readOnly className="mono" placeholder="Click generate…" />
        <Button onClick={() => { pushClipboard(pwd); notify("Copied"); }}><Copy size={14} /></Button>
        <Button onClick={gen}><RefreshCw size={14} /></Button>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full transition-all" style={{ width: `${score}%`, background: score < 40 ? "#ef4444" : score < 70 ? "#f59e0b" : "#10b981" }} /></div>
      <label className="flex justify-between">Length: {length}<input type="range" min={8} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="w-1/2" /></label>
      {[["Uppercase",upper,setUpper],["Lowercase",lower,setLower],["Numbers",nums,setNums],["Symbols",syms,setSyms]].map(([l,v,s]: any) => (
        <label key={l} className="flex items-center gap-2"><input type="checkbox" checked={v} onChange={(e) => s(e.target.checked)} />{l}</label>
      ))}
    </div>
  );
}
