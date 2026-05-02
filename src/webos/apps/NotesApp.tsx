import { useEffect, useState } from "react";
import { AppShell, useLocalStorage, downloadText } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type Note = { id: string; title: string; content: string; updated: number };

export function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("webos-notes", [
    { id: "1", title: "Welcome", content: "Welcome to WebOS Notes.\nEverything saves locally.", updated: Date.now() },
  ]);
  const [activeId, setActive] = useState<string>(notes[0]?.id || "");
  const [q, setQ] = useState("");
  const active = notes.find((n) => n.id === activeId);

  useEffect(() => { if (!active && notes[0]) setActive(notes[0].id); }, [notes, active]);

  function newNote() {
    const n = { id: Math.random().toString(36).slice(2), title: "Untitled", content: "", updated: Date.now() };
    setNotes([n, ...notes]);
    setActive(n.id);
  }
  function update(id: string, p: Partial<Note>) {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...p, updated: Date.now() } : n)));
  }
  const filtered = notes.filter((n) =>
    !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.content.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell sidebar={
      <div className="p-2 space-y-2">
        <Button size="sm" className="w-full" onClick={newNote}><Plus size={14} className="mr-1" />New</Button>
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 text-sm" />
        <div className="space-y-1">
          {filtered.map((n) => (
            <button key={n.id} onClick={() => setActive(n.id)} className={`w-full text-left p-2 rounded text-sm ${activeId === n.id ? "bg-accent" : "hover:bg-accent/50"}`}>
              <div className="font-medium truncate">{n.title || "Untitled"}</div>
              <div className="text-xs text-muted-foreground truncate">{n.content.slice(0, 40)}</div>
            </button>
          ))}
        </div>
      </div>
    }>
      {active ? (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b flex gap-2 items-center">
            <Input value={active.title} onChange={(e) => update(active.id, { title: e.target.value })} className="text-lg font-semibold border-0 shadow-none" />
            <Button variant="outline" size="sm" onClick={() => downloadText(active.content, `${active.title}.md`, "text/markdown")}>Export .md</Button>
            <Button variant="ghost" size="icon" onClick={() => { setNotes(notes.filter((n) => n.id !== active.id)); }}><Trash2 size={14} /></Button>
          </div>
          <Textarea value={active.content} onChange={(e) => update(active.id, { content: e.target.value })} className="flex-1 border-0 resize-none rounded-none text-sm" />
          <div className="border-t px-3 py-1 text-xs text-muted-foreground">
            {active.content.split(/\s+/).filter(Boolean).length} words · {active.content.length} chars
          </div>
        </div>
      ) : <div className="p-6 text-muted-foreground">No note selected</div>}
    </AppShell>
  );
}
