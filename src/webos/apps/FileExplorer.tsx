import { useState } from "react";
import { AppShell, useLocalStorage, downloadText } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, FileText, Trash2, ArrowLeft, Plus, Pencil, Download, Copy } from "lucide-react";
import { pushClipboard, notify } from "../kernel";

type Item = { name: string; type: "folder" | "file"; size?: number; content?: string };

export function FileExplorer() {
  const [files, setFiles] = useLocalStorage<Record<string, Item[]>>("webos-fs", {
    "/": [
      { name: "Documents", type: "folder" },
      { name: "Downloads", type: "folder" },
      { name: "Desktop", type: "folder" },
      { name: "Trash", type: "folder" },
      { name: "readme.txt", type: "file", size: 256, content: "Welcome to your WebOS file system.\nRight-click items or use the toolbar to manage files." },
    ],
    "/Documents": [{ name: "notes.md", type: "file", size: 120, content: "# Notes" }],
    "/Downloads": [], "/Desktop": [], "/Trash": [],
  });
  const [path, setPath] = useState("/");
  const [editing, setEditing] = useState<Item | null>(null);
  const [draftName, setDraftName] = useState("");
  const items = files[path] || [];

  function open(it: Item) {
    if (it.type === "folder") setPath(path === "/" ? "/" + it.name : path + "/" + it.name);
    else setEditing(it);
  }
  function trash(it: Item) {
    setFiles({ ...files, [path]: items.filter(x => x.name !== it.name), "/Trash": [...(files["/Trash"] || []), it] });
  }
  function rename(it: Item) {
    const nn = prompt("New name:", it.name); if (!nn || nn === it.name) return;
    setFiles({ ...files, [path]: items.map(x => x.name === it.name ? { ...x, name: nn } : x) });
  }
  function newFile() {
    const n = prompt("File name:", "untitled.txt"); if (!n) return;
    setFiles({ ...files, [path]: [...items, { name: n, type: "file", size: 0, content: "" }] });
  }
  function newFolder() {
    const n = prompt("Folder name:", "New Folder"); if (!n) return;
    const newPath = path === "/" ? "/" + n : path + "/" + n;
    setFiles({ ...files, [path]: [...items, { name: n, type: "folder" }], [newPath]: [] });
  }
  function saveEdit() {
    if (!editing) return;
    setFiles({ ...files, [path]: items.map(x => x.name === editing.name ? { ...editing, size: editing.content?.length || 0 } : x) });
    setEditing(null);
  }

  return (
    <AppShell
      toolbar={
        <>
          <Button size="icon" variant="ghost" onClick={() => setPath("/" + path.split("/").filter(Boolean).slice(0, -1).join("/"))} disabled={path === "/"}><ArrowLeft size={14} /></Button>
          <div className="mono text-sm flex-1 truncate">{path}</div>
          <Button size="sm" variant="outline" onClick={newFile}><Plus size={12} className="mr-1"/>File</Button>
          <Button size="sm" variant="outline" onClick={newFolder}><Folder size={12} className="mr-1"/>Folder</Button>
        </>
      }
      sidebar={
        <div className="p-2 space-y-1">
          {["/", "/Documents", "/Downloads", "/Desktop", "/Trash"].map(p => (
            <button key={p} onClick={() => setPath(p)} className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${path === p ? "bg-accent" : "hover:bg-accent/50"}`}>
              <Folder size={14} /> {p === "/" ? "Home" : p.slice(1)}
            </button>
          ))}
        </div>
      }
    >
      {editing ? (
        <div className="flex flex-col h-full">
          <div className="border-b p-2 flex gap-2 items-center">
            <Input value={draftName || editing.name} onChange={(e) => setDraftName(e.target.value)} className="text-sm flex-1" />
            <Button size="sm" onClick={() => { if (draftName) setEditing({ ...editing, name: draftName }); saveEdit(); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
          <textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="flex-1 p-3 mono text-sm bg-card outline-none resize-none" />
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.length === 0 && <div className="col-span-full text-sm text-muted-foreground">Empty folder</div>}
          {items.map(it => (
            <div key={it.name} className="bg-card border rounded-xl p-3 group relative cursor-pointer hover:bg-accent" onDoubleClick={() => open(it)}>
              <div className="flex justify-center">
                {it.type === "folder" ? <Folder size={40} className="text-primary" /> : <FileText size={40} className="text-muted-foreground" />}
              </div>
              <div className="text-xs text-center mt-2 truncate">{it.name}</div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-card rounded p-0.5">
                {it.type === "file" && <button onClick={(e) => { e.stopPropagation(); pushClipboard(it.content || ""); notify("Copied content"); }}><Copy size={11}/></button>}
                {it.type === "file" && <button onClick={(e) => { e.stopPropagation(); downloadText(it.content || "", it.name); }}><Download size={11}/></button>}
                <button onClick={(e) => { e.stopPropagation(); rename(it); }}><Pencil size={11}/></button>
                <button onClick={(e) => { e.stopPropagation(); trash(it); }}><Trash2 size={11} className="text-destructive"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
