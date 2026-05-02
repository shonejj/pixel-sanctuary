import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PRESETS = [
  { name: "Email", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+" },
  { name: "URL", pattern: "https?://[\\w.-]+(?:/[\\w./?=&%-]*)?" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Date YYYY-MM-DD", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { name: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
];

export function RegexVisualizer() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [test, setTest] = useState(
    "Contact us at help@webos.dev or admin@example.com.\nVisit https://example.com.",
  );

  const { highlighted, matches, error } = useMemo(() => run(pattern, flags, test), [pattern, flags, test]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-[1fr_280px] gap-4 h-full">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <span className="mono text-muted-foreground">/</span>
            <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="mono flex-1" />
            <span className="mono text-muted-foreground">/</span>
            <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="mono w-20" />
          </div>
          {error && <div className="text-xs text-destructive mono">{error}</div>}
          <Textarea value={test} onChange={(e) => setTest(e.target.value)} className="min-h-[120px] mono text-sm" />
          <div className="bg-card border rounded-xl p-3 mono text-sm whitespace-pre-wrap break-words flex-1 overflow-auto" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
        <div className="space-y-3">
          <div className="bg-card border rounded-xl p-3">
            <div className="text-sm font-semibold mb-2">Matches: {matches.length}</div>
            <div className="space-y-1 max-h-60 overflow-auto text-xs mono">
              {matches.map((m, i) => (
                <div key={i} className="border-b border-border/50 py-1">
                  <span className="text-primary">[{m.index}]</span> {m.text}
                  {m.groups.length > 0 && (
                    <div className="pl-3 text-muted-foreground">
                      {m.groups.map((g, j) => <div key={j}>${j + 1}: {g}</div>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-3">
            <div className="text-sm font-semibold mb-2">Common patterns</div>
            <div className="space-y-1">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => setPattern(p.pattern)} className="w-full text-left text-xs hover:bg-accent rounded px-2 py-1">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function run(pattern: string, flags: string, test: string) {
  try {
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const matches: { index: number; text: string; groups: string[] }[] = [];
    let m;
    let html = "";
    let last = 0;
    while ((m = re.exec(test)) !== null) {
      if (m.index === re.lastIndex) re.lastIndex++;
      html += escape(test.slice(last, m.index));
      html += `<mark style="background:oklch(0.78 0.16 80 / 0.6); padding:0 2px; border-radius:2px;">${escape(m[0])}</mark>`;
      last = m.index + m[0].length;
      matches.push({ index: m.index, text: m[0], groups: m.slice(1) as string[] });
      if (matches.length > 500) break;
    }
    html += escape(test.slice(last));
    return { highlighted: html, matches, error: null as string | null };
  } catch (e: any) {
    return { highlighted: escape(test), matches: [], error: e.message };
  }
}
function escape(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
