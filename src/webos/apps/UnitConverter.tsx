import { useState } from "react";
import { Input } from "@/components/ui/input";

const cats = {
  Length: { meter: 1, foot: 0.3048, inch: 0.0254, km: 1000, mile: 1609.34, yard: 0.9144 },
  Weight: { kg: 1, gram: 0.001, pound: 0.453592, ounce: 0.0283495 },
  Temperature: { C: 1, F: 1, K: 1 },
  Volume: { liter: 1, gallon: 3.78541, ml: 0.001, cup: 0.236588 },
  Time: { second: 1, minute: 60, hour: 3600, day: 86400 },
};

function tempConvert(v: number, from: string, to: string) {
  let c = from === "C" ? v : from === "F" ? (v-32)*5/9 : v - 273.15;
  return to === "C" ? c : to === "F" ? c*9/5+32 : c + 273.15;
}

export function UnitConverter() {
  const [cat, setCat] = useState<keyof typeof cats>("Length");
  const units = Object.keys(cats[cat]);
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1]);
  const [val, setVal] = useState("1");

  const result = (() => {
    const v = parseFloat(val); if (isNaN(v)) return "";
    if (cat === "Temperature") return tempConvert(v, from, to).toFixed(4);
    const m = (cats[cat] as any);
    return ((v * m[from]) / m[to]).toFixed(6);
  })();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-background h-full">
      <h1 className="text-2xl font-bold">Unit Converter</h1>
      <select className="w-full p-2 rounded border bg-card" value={cat} onChange={(e) => { const c = e.target.value as any; setCat(c); setFrom(Object.keys(cats[c as keyof typeof cats])[0]); setTo(Object.keys(cats[c as keyof typeof cats])[1]); }}>
        {Object.keys(cats).map(c => <option key={c}>{c}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm text-muted-foreground">From</label><Input value={val} onChange={(e) => setVal(e.target.value)} /><select className="mt-1 w-full p-2 rounded border bg-card" value={from} onChange={(e) => setFrom(e.target.value)}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
        <div><label className="text-sm text-muted-foreground">To</label><Input value={result} readOnly /><select className="mt-1 w-full p-2 rounded border bg-card" value={to} onChange={(e) => setTo(e.target.value)}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
      </div>
    </div>
  );
}
