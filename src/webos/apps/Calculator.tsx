// New: Calculator
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  function input(d: string) {
    if (reset || display === "0") { setDisplay(d === "." ? "0." : d); setReset(false); }
    else setDisplay(display + d);
  }
  function setOperation(o: string) {
    const n = parseFloat(display);
    if (prev === null) setPrev(n);
    else if (op) setPrev(compute(prev, n, op));
    setOp(o); setReset(true);
    if (op) setDisplay(String(compute(prev!, n, op)));
  }
  function compute(a: number, b: number, o: string) {
    return o === "+" ? a+b : o === "-" ? a-b : o === "×" ? a*b : o === "÷" ? a/b : b;
  }
  function equals() {
    if (op === null || prev === null) return;
    setDisplay(String(compute(prev, parseFloat(display), op)));
    setPrev(null); setOp(null); setReset(true);
  }
  function clear() { setDisplay("0"); setPrev(null); setOp(null); setReset(false); }

  const btn = (l: string, c: string, fn: () => void, span = 1) => (
    <Button key={l} onClick={fn} variant={c as any} className={`h-14 text-lg ${span === 2 ? "col-span-2" : ""}`}>{l}</Button>
  );

  return (
    <div className="flex flex-col h-full p-3 gap-3 bg-background">
      <div className="flex-1 bg-card rounded-xl flex items-end justify-end p-4 text-4xl mono break-all">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {btn("AC", "secondary", clear)}
        {btn("±", "secondary", () => setDisplay(String(-parseFloat(display))))}
        {btn("%", "secondary", () => setDisplay(String(parseFloat(display)/100)))}
        {btn("÷", "default", () => setOperation("÷"))}
        {["7","8","9"].map(d => btn(d, "outline", () => input(d)))}
        {btn("×", "default", () => setOperation("×"))}
        {["4","5","6"].map(d => btn(d, "outline", () => input(d)))}
        {btn("-", "default", () => setOperation("-"))}
        {["1","2","3"].map(d => btn(d, "outline", () => input(d)))}
        {btn("+", "default", () => setOperation("+"))}
        {btn("0", "outline", () => input("0"), 2)}
        {btn(".", "outline", () => input("."))}
        {btn("=", "default", equals)}
      </div>
    </div>
  );
}
