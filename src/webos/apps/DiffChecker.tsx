import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { diffLines } from "diff";

export function DiffChecker() {
  const [a, setA] = useState("function add(a, b) {\n  return a + b;\n}\n\nadd(1, 2);");
  const [b, setB] = useState("function add(a, b) {\n  // Adds two numbers\n  return a + b;\n}\n\nconst result = add(1, 2);");

  const diff = useMemo(() => diffLines(a, b), [a, b]);
  const stats = useMemo(() => {
    let add = 0, del = 0, eq = 0;
    diff.forEach((p) => {
      const lines = p.value.split("\n").filter(Boolean).length;
      if (p.added) add += lines;
      else if (p.removed) del += lines;
      else eq += lines;
    });
    return { add, del, eq };
  }, [diff]);

  return (
    <AppShell>
      <div className="p-6 space-y-3 h-full flex flex-col">
        <div className="grid md:grid-cols-2 gap-3">
          <Textarea value={a} onChange={(e) => setA(e.target.value)} className="mono text-sm min-h-[150px]" placeholder="Original" />
          <Textarea value={b} onChange={(e) => setB(e.target.value)} className="mono text-sm min-h-[150px]" placeholder="Modified" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const t = a; setA(b); setB(t); }}>Swap</Button>
          <Button variant="outline" onClick={() => { setA(""); setB(""); }}>Clear both</Button>
          <div className="ml-auto text-sm text-muted-foreground">
            <span className="text-emerald-500">+{stats.add}</span> · <span className="text-destructive">-{stats.del}</span> · ={stats.eq}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-0 mono text-xs flex-1 overflow-auto">
          {diff.map((part, i) => (
            <div key={i} className={part.added ? "bg-emerald-500/15 border-l-4 border-emerald-500" : part.removed ? "bg-destructive/15 border-l-4 border-destructive" : ""}>
              {part.value.split("\n").map((l, j) => (
                l !== "" || j !== part.value.split("\n").length - 1 ? (
                  <div key={j} className="px-3 py-0.5 whitespace-pre">{part.added ? "+ " : part.removed ? "- " : "  "}{l}</div>
                ) : null
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
