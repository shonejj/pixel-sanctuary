import { useState } from "react";
import { AppShell, useLocalStorage, downloadText } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, FileText, Trash2, ArrowLeft, Plus, Pencil, Download, Copy, Upload } from "lucide-react";
import { pushClipboard, notify } from "../kernel";

type Item = { name: string; type: "folder" | "file"; size?: number; content?: string };

export function FileExplorer() {
  const [files, setFiles] = useLocalStorage<Record<string, Item[]>>("webos-fs", {
    "/": [
      { name: "Workspace", type: "folder" },
      { name: "readme.txt", type: "file", size: 256, content: "Welcome to your WebOS file system.\n\nEverything is local — nothing leaves your browser.\nUse the toolbar to create files & folders, upload files, or organize your work." },
    ],
    "/Workspace": [{ name: "notes.md", type: "file", size: 16, content: "# Notes\n\nStart writing…" }],
  });
  const [path, setPath] = useState("/");
  const [editing, setEditing] = useState<Item | null>(null);
  const [draftName, setDraftName] = useState("");
  const items = files[path] || [];

  const folderPaths = Object.keys(files).filter(p => p !== "/");

  function open(it: Item) {
    if (it.type === "folder") {
      const np = path === "/" ? "/" + it.name : path + "/" + it.name;
      if (!files[np]) setFiles({ ...files, [np]: [] });
      setPath(np);
    } else { setEditing(it); setDraftName(it.name); }
  }
  function remove(it: Item) {
    if (!confirm(`Delete "${it.name}"?`)) return;
    const next = { ...files, [path]: items.filter(x => x.name !== it.name) };
    if (it.type === "folder") {
      const fp = path === "/" ? "/" + it.name : path + "/" + it.name;
      Object.keys(next).filter(k => k === fp || k.startsWith(fp + "/")).forEach(k => delete next[k]);
    }
    setFiles(next);
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
  function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || []);
    const next = { ...files }; let cur = [...items];
    let pending = fs.length;
    fs.forEach(f => {
      const r = new FileReader();
      r.onload = () => {
        cur.push({ name: f.name, type: "file", size: f.size, content: String(r.result || "") });
        if (--pending === 0) { next[path] = cur; setFiles(next); }
      };
      r.readAsText(f);
    });
    e.target.value = "";
  }
  function saveEdit() {
    if (!editing) return;
    const nm = draftName || editing.name;
    setFiles({ ...files, [path]: items.map(x => x.name === editing.name ? { ...editing, name: nm, size: editing.content?.length || 0 } : x) });
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
          <label>
            <input type="file" hidden multiple onChange={uploadFile} />
            <span className="cursor-pointer inline-flex items-center text-xs px-2.5 py-1.5 border rounded-md hover:bg-accent"><Upload size={12} className="mr-1"/>Upload</span>
          </label>
        </>
      }
      sidebar={
        <div className="p-2 space-y-0.5">
          <button onClick={() => setPath("/")} className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${path === "/" ? "bg-accent" : "hover:bg-accent/50"}`}>
            <Folder size={14} /> Home
          </button>
          {folderPaths.map(p => (
            <button key={p} onClick={() => setPath(p)} className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${path === p ? "bg-accent" : "hover:bg-accent/50"}`} style={{ paddingLeft: 8 + (p.split("/").length - 2) * 12 }}>
              <Folder size={14} /> {p.split("/").pop()}
            </button>
          ))}
        </div>
      }
    >
      {editing ? (
        <div className="flex flex-col h-full">
          <div className="border-b p-2 flex gap-2 items-center">
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="text-sm flex-1" />
            <Button size="sm" onClick={saveEdit}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
          <textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="flex-1 p-3 mono text-sm bg-card outline-none resize-none" />
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.length === 0 && <div className="col-span-full text-sm text-muted-foreground text-center py-12">Empty folder. Use the toolbar to add files.</div>}
          {items.map(it => (
            <div key={it.name} className="bg-card border rounded-xl p-3 group relative cursor-pointer hover:bg-accent transition" onDoubleClick={() => open(it)} onClick={() => open(it)}>
              <div className="flex justify-center">
                {it.type === "folder" ? <Folder size={40} className="text-primary" /> : <FileText size={40} className="text-muted-foreground" />}
              </div>
              <div className="text-xs text-center mt-2 truncate">{it.name}</div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-card rounded p-0.5 border">
                {it.type === "file" && <button onClick={(e) => { e.stopPropagation(); pushClipboard(it.content || ""); notify("Copied content"); }} title="Copy"><Copy size={11}/></button>}
                {it.type === "file" && <button onClick={(e) => { e.stopPropagation(); downloadText(it.content || "", it.name); }} title="Download"><Download size={11}/></button>}
                <button onClick={(e) => { e.stopPropagation(); rename(it); }} title="Rename"><Pencil size={11}/></button>
                <button onClick={(e) => { e.stopPropagation(); remove(it); }} title="Delete"><Trash2 size={11} className="text-destructive"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
