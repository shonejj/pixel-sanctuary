import { useEffect, useState } from "react";
import { AppShell, useLocalStorage, downloadText } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Copy, Pencil, Check } from "lucide-react";
import { pushClipboard, notify } from "../kernel";

type Note = { id: string; title: string; content: string; updated: number };

export function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("webos-notes", [
    { id: "1", title: "Welcome", content: "# Welcome to WebOS Notes\n\nEverything saves locally.\nClick the pencil to rename, trash to delete.", updated: Date.now() },
  ]);
  const [activeId, setActive] = useState<string>(notes[0]?.id || "");
  const [q, setQ] = useState("");
  const [renaming, setRenaming] = useState(false);
  const active = notes.find(n => n.id === activeId);

  useEffect(() => { if (!active && notes[0]) setActive(notes[0].id); }, [notes, active]);

  function newNote() {
    const n = { id: Math.random().toString(36).slice(2), title: "Untitled", content: "", updated: Date.now() };
    setNotes([n, ...notes]); setActive(n.id);
  }
  function update(id: string, p: Partial<Note>) {
    setNotes(notes.map(n => n.id === id ? { ...n, ...p, updated: Date.now() } : n));
  }
  function del(id: string) {
    if (!confirm("Delete this note?")) return;
    setNotes(notes.filter(n => n.id !== id));
  }
  const filtered = notes.filter(n => !q || n.title.toLowerCase().includes(q.toLowerCase()) || n.content.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell sidebar={
      <div className="p-2 space-y-2">
        <Button size="sm" className="w-full" onClick={newNote}><Plus size={14} className="mr-1" />New note</Button>
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 text-sm" />
        <div className="space-y-1">
          {filtered.map(n => (
            <div key={n.id} className={`group p-2 rounded text-sm cursor-pointer flex items-start gap-1 ${activeId === n.id ? "bg-accent" : "hover:bg-accent/50"}`} onClick={() => setActive(n.id)}>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{n.title || "Untitled"}</div>
                <div className="text-xs text-muted-foreground truncate">{n.content.slice(0, 40) || "Empty"}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); del(n.id); }} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
      </div>
    }>
      {active ? (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b flex gap-2 items-center flex-wrap">
            {renaming ? (
              <Input autoFocus value={active.title} onChange={(e) => update(active.id, { title: e.target.value })} onBlur={() => setRenaming(false)} onKeyDown={(e) => e.key === "Enter" && setRenaming(false)} className="text-base font-semibold flex-1" />
            ) : (
              <h2 className="text-lg font-semibold flex-1 truncate">{active.title}</h2>
            )}
            <Button size="icon" variant="ghost" onClick={() => setRenaming(!renaming)}>{renaming ? <Check size={14}/> : <Pencil size={14}/>}</Button>
            <Button size="icon" variant="ghost" onClick={() => { pushClipboard(active.content); notify("Copied"); }}><Copy size={14}/></Button>
            <Button size="icon" variant="ghost" onClick={() => downloadText(active.content, `${active.title}.md`, "text/markdown")}><Download size={14}/></Button>
            <Button size="icon" variant="ghost" onClick={() => del(active.id)}><Trash2 size={14}/></Button>
          </div>
          <Textarea value={active.content} onChange={(e) => update(active.id, { content: e.target.value })} className="flex-1 border-0 resize-none rounded-none text-sm mono" placeholder="Start writing… markdown supported" />
          <div className="border-t px-3 py-1 text-xs text-muted-foreground flex justify-between">
            <span>{active.content.split(/\s+/).filter(Boolean).length} words · {active.content.length} chars</span>
            <span>Saved {new Date(active.updated).toLocaleTimeString()}</span>
          </div>
        </div>
      ) : <div className="p-6 text-muted-foreground">No note selected · Create one to begin</div>}
    </AppShell>
  );
}
