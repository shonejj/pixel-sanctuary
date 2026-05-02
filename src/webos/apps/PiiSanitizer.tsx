import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { pushClipboard } from "../kernel";

type Mode = "redact" | "pseudo" | "random";

const PATTERNS: { name: string; re: RegExp; gen: (i: number) => string }[] = [
  { name: "EMAIL", re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, gen: (i) => `user${i}@example.com` },
  { name: "PHONE", re: /\b(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, gen: (i) => `555-010-${1000 + i}` },
  { name: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g, gen: () => `XXX-XX-XXXX` },
  { name: "IPV4", re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, gen: (i) => `10.0.0.${i}` },
  { name: "CC", re: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, gen: () => `4111 1111 1111 1111` },
  { name: "APIKEY", re: /\b[A-Za-z0-9_-]{32,}\b/g, gen: (i) => `sk_test_${"0".repeat(28)}${i}` },
];

export function PiiSanitizer() {
  const [text, setText] = useState(
    "Email me at jane.doe@example.com or call 415-555-0123. SSN 123-45-6789, IP 192.168.1.1, key abcdef0123456789abcdef0123456789ab",
  );
  const [mode, setMode] = useState<Mode>("pseudo");

  const { output, mapping } = useMemo(() => sanitize(text, mode), [text, mode]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 min-h-[300px] text-sm" />
          <div className="flex gap-2">
            {(["redact", "pseudo", "random"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded text-sm border ${mode === m ? "bg-primary text-primary-foreground" : "bg-card"}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-card border rounded-xl p-3 flex-1 overflow-auto">
            <div className="text-sm font-semibold mb-2">Sanitized</div>
            <pre className="mono text-xs whitespace-pre-wrap break-words">{output}</pre>
          </div>
          <div className="bg-card border rounded-xl p-3 max-h-40 overflow-auto">
            <div className="text-sm font-semibold mb-2">Mapping ({mapping.length})</div>
            <table className="text-xs mono w-full">
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={i}><td className="text-muted-foreground pr-2">{m.placeholder}</td><td className="break-all">{m.original}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" onClick={() => pushClipboard(output)}>Copy sanitized</Button>
        </div>
      </div>
    </AppShell>
  );
}

function sanitize(text: string, mode: Mode) {
  const mapping: { placeholder: string; original: string }[] = [];
  let out = text;
  PATTERNS.forEach((p) => {
    let i = 1;
    out = out.replace(p.re, (m) => {
      const placeholder =
        mode === "redact" ? "█".repeat(Math.max(4, m.length)) :
        mode === "random" ? p.gen(i) :
        `[${p.name}_${i}]`;
      mapping.push({ placeholder, original: m });
      i++;
      return placeholder;
    });
  });
  return { output: out, mapping };
}
