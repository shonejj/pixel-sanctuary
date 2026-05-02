import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";

const DICT: { term: RegExp; plain: string; risk?: string }[] = [
  { term: /\bhereinafter\b/gi, plain: "from now on" },
  { term: /\bheretofore\b/gi, plain: "until now" },
  { term: /\bnotwithstanding\b/gi, plain: "despite" },
  { term: /\bin perpetuity\b/gi, plain: "forever", risk: "Forever rights granted" },
  { term: /\bindemnify( and hold harmless)?\b/gi, plain: "you agree to cover our losses", risk: "Indemnification clause" },
  { term: /\barbitration\b/gi, plain: "settle disputes outside court", risk: "Mandatory arbitration — you give up your right to sue" },
  { term: /\bclass action waiver\b/gi, plain: "you can't join a class action lawsuit", risk: "Class action waiver" },
  { term: /\bgoverning law\b/gi, plain: "the laws used to interpret this contract" },
  { term: /\bsole discretion\b/gi, plain: "we decide alone, with no checks", risk: "Unilateral decision power" },
  { term: /\bperpetual,? (?:irrevocable|royalty-free) license\b/gi, plain: "we get to use your content forever, for free", risk: "Broad content license" },
  { term: /\bsublicense\b/gi, plain: "give your content to other companies", risk: "Sublicensing rights" },
  { term: /\bauto-?renew(?:s|al)?\b/gi, plain: "renews automatically unless you cancel", risk: "Auto-renewal" },
  { term: /\bsubject to change\b/gi, plain: "we can change this any time" },
  { term: /\bsever(ability|able)\b/gi, plain: "if one part is invalid, the rest still applies" },
  { term: /\bwithout notice\b/gi, plain: "without telling you", risk: "Changes without notice" },
  { term: /\bas-?is\b/gi, plain: "no warranty — at your own risk" },
];

export function LegalDecoder() {
  const [text, setText] = useState(
    "By using the Service, you agree to indemnify and hold harmless Company from any claims. Disputes shall be resolved by binding arbitration. We grant ourselves a perpetual, irrevocable license to your content. Subject to change without notice.",
  );
  const result = useMemo(() => decode(text), [text]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Original</div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 min-h-[400px] text-sm" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-card border rounded-xl p-3 flex-1 overflow-auto">
            <div className="text-sm font-semibold mb-2">Plain English</div>
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: result.html }} />
          </div>
          <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-3">
            <div className="text-sm font-semibold mb-2 text-destructive">⚠️ Risk flags</div>
            {result.risks.length === 0 ? (
              <div className="text-sm text-muted-foreground">No risk flags detected.</div>
            ) : (
              <ul className="text-sm list-disc list-inside text-destructive">
                {result.risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function decode(text: string) {
  let html = escapeHtml(text);
  const risks = new Set<string>();
  DICT.forEach((d) => {
    if (d.term.test(text)) {
      html = html.replace(d.term, (m) => `<mark style="background:oklch(0.85 0.15 80 / 0.5); padding:0 2px; border-radius:2px;" title="${d.plain}">${m} <span style="color:oklch(0.55 0.22 265); font-weight:600;">→ ${d.plain}</span></mark>`);
      if (d.risk) risks.add(d.risk);
    }
    d.term.lastIndex = 0;
  });
  return { html, risks: Array.from(risks) };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
