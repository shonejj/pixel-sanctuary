import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import nlp from "compromise";

const POS = ["good", "great", "love", "excellent", "amazing", "best", "useful", "nice", "happy", "agree", "correct", "right", "thanks", "thank"];
const NEG = ["bad", "hate", "terrible", "awful", "worst", "broken", "stupid", "wrong", "fail", "problem", "issue", "disagree", "annoying", "useless"];

export function ThreadSummarizer() {
  const [text, setText] = useState(
    "I really love this approach, it solves so many problems. \nDisagree, this seems overengineered to me.\nThe API design is excellent and clean.\nIt's broken in production for us — please fix.\nGreat work overall!",
  );

  const res = useMemo(() => analyze(text), [text]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[400px] text-sm" />
        <div className="space-y-3">
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Sentiment</div>
            <div className="flex h-3 rounded overflow-hidden">
              <div className="bg-emerald-500" style={{ width: `${res.pos}%` }} />
              <div className="bg-muted" style={{ width: `${res.neu}%` }} />
              <div className="bg-destructive" style={{ width: `${res.neg}%` }} />
            </div>
            <div className="text-xs mt-1 flex justify-between text-muted-foreground">
              <span>+{res.pos.toFixed(0)}%</span><span>~{res.neu.toFixed(0)}%</span><span>-{res.neg.toFixed(0)}%</span>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Key topics</div>
            <div className="flex flex-wrap gap-2">
              {res.keywords.map((k) => (
                <span key={k.word} className="px-2 py-1 rounded bg-primary/15 text-primary" style={{ fontSize: 11 + k.count * 2 }}>
                  {k.word} <span className="opacity-60">{k.count}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="text-sm font-semibold mb-2">Top arguments</div>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {res.top.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function analyze(text: string) {
  const doc = nlp(text);
  const sentences: string[] = doc.sentences().out("array");
  let pos = 0, neg = 0, neu = 0;
  const scored: { s: string; score: number }[] = [];
  sentences.forEach((s) => {
    const lc = s.toLowerCase();
    let sc = 0;
    POS.forEach((w) => { if (lc.includes(w)) sc++; });
    NEG.forEach((w) => { if (lc.includes(w)) sc--; });
    if (sc > 0) pos++; else if (sc < 0) neg++; else neu++;
    scored.push({ s, score: Math.abs(sc) });
  });
  const total = sentences.length || 1;
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 5).map((x) => x.s);
  // keywords
  const counts: Record<string, number> = {};
  const nouns: string[] = doc.nouns().out("array");
  nouns.forEach((n) => {
    const k = n.toLowerCase().replace(/[^\w]/g, "");
    if (k.length > 3) counts[k] = (counts[k] || 0) + 1;
  });
  const keywords = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word, count]) => ({ word, count }));
  return { pos: (pos / total) * 100, neg: (neg / total) * 100, neu: (neu / total) * 100, keywords, top };
}
