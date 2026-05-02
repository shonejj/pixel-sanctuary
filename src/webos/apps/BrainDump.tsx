import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { pushClipboard } from "../kernel";

const URGENT = /\b(today|tomorrow|asap|urgent|now|tonight|this week|deadline|due)\b/i;
const ACTION = /\b(call|email|buy|schedule|fix|submit|send|write|review|book|pay|cancel|order|finish|build|update|reply|message)\b/i;

export function BrainDump() {
  const [text, setText] = useState(
    "Call dentist tomorrow\nFix bathroom leak ASAP\nIdea: would be cool to learn rust\nReply to mom\nRandom thought about future\nbuy milk today",
  );
  const result = useMemo(() => sort(text), [text]);

  function copyMd() {
    const md = ["## Priority", ...result.priority.map((s) => "- [ ] " + s), "\n## Tasks", ...result.tasks.map((s) => "- [ ] " + s), "\n## Notes", ...result.notes.map((s) => "- " + s)].join("\n");
    pushClipboard(md);
  }

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Dump everything on your mind</div>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 min-h-[400px]" />
          <Button variant="outline" onClick={copyMd}>Copy as Markdown checklist</Button>
        </div>
        <div className="grid grid-rows-3 gap-3">
          <Col title="🔥 Priority" items={result.priority} color="bg-destructive/10 border-destructive/30" />
          <Col title="✅ Tasks" items={result.tasks} color="bg-primary/10 border-primary/30" />
          <Col title="💭 Notes" items={result.notes} color="bg-muted border-border" />
        </div>
      </div>
    </AppShell>
  );
}

function Col({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className={`rounded-xl p-3 border overflow-auto ${color}`}>
      <div className="text-sm font-semibold mb-2">{title} ({items.length})</div>
      <ul className="text-sm space-y-1">
        {items.map((s, i) => <li key={i} className="bg-background/60 rounded px-2 py-1">{s}</li>)}
      </ul>
    </div>
  );
}

function sort(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const priority: string[] = [];
  const tasks: string[] = [];
  const notes: string[] = [];
  lines.forEach((l) => {
    const isAction = ACTION.test(l);
    const isUrgent = URGENT.test(l);
    if (isAction && isUrgent) priority.push(l);
    else if (isAction) tasks.push(l);
    else notes.push(l);
  });
  return { priority, tasks, notes };
}
