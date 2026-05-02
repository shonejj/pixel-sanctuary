import { useState } from "react";
import { AppShell, useLocalStorage } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Folder, FileText, Trash2, ArrowLeft } from "lucide-react";

type Item = { name: string; type: "folder" | "file"; size?: number; content?: string };

export function FileExplorer() {
  const [files, setFiles] = useLocalStorage<Record<string, Item[]>>("webos-fs", {
    "/": [
      { name: "Documents", type: "folder" },
      { name: "Downloads", type: "folder" },
      { name: "Desktop", type: "folder" },
      { name: "Trash", type: "folder" },
      { name: "readme.txt", type: "file", size: 256, content: "Welcome to your WebOS file system." },
    ],
    "/Documents": [{ name: "notes.md", type: "file", size: 120, content: "# Notes" }],
    "/Downloads": [],
    "/Desktop": [],
    "/Trash": [],
  });
  const [path, setPath] = useState("/");
  const items = files[path] || [];

  function open(it: Item) {
    if (it.type === "folder") setPath(path === "/" ? "/" + it.name : path + "/" + it.name);
  }
  function trash(it: Item) {
    setFiles({
      ...files,
      [path]: items.filter((x) => x.name !== it.name),
      "/Trash": [...(files["/Trash"] || []), it],
    });
  }

  return (
    <AppShell
      toolbar={
        <>
          <Button size="sm" variant="ghost" onClick={() => setPath("/" + path.split("/").filter(Boolean).slice(0, -1).join("/"))} disabled={path === "/"}>
            <ArrowLeft size={14} />
          </Button>
          <div className="mono text-sm">{path}</div>
        </>
      }
      sidebar={
        <div className="p-2 space-y-1">
          {["/", "/Documents", "/Downloads", "/Desktop", "/Trash"].map((p) => (
            <button key={p} onClick={() => setPath(p)} className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${path === p ? "bg-accent" : "hover:bg-accent/50"}`}>
              <Folder size={14} /> {p === "/" ? "Home" : p.slice(1)}
            </button>
          ))}
        </div>
      }
    >
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.length === 0 && <div className="col-span-full text-sm text-muted-foreground">Empty folder</div>}
        {items.map((it) => (
          <div key={it.name} className="bg-card border rounded-xl p-3 group relative cursor-pointer hover:bg-accent" onDoubleClick={() => open(it)}>
            <div className="flex justify-center">
              {it.type === "folder" ? <Folder size={40} className="text-primary" /> : <FileText size={40} className="text-muted-foreground" />}
            </div>
            <div className="text-xs text-center mt-2 truncate">{it.name}</div>
            <button onClick={() => trash(it)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
