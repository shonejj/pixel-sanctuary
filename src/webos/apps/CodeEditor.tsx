import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useLocalStorage } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play, Save } from "lucide-react";
import { useWebOS } from "../kernel";

type CodeFile = { id: string; name: string; lang: string; content: string };

const LANGS = ["javascript","typescript","python","html","css","json","markdown","sql","go","rust"];
const TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript playground\nfunction fib(n) {\n  return n < 2 ? n : fib(n-1) + fib(n-2);\n}\nconsole.log(fib(10));`,
  typescript: `interface User { name: string; age: number }\nconst u: User = { name: "Ada", age: 36 };\nconsole.log(u);`,
  python: `def fib(n):\n  return n if n < 2 else fib(n-1) + fib(n-2)\n\nprint(fib(10))`,
  html: `<!DOCTYPE html>\n<html><body>\n  <h1>Hello</h1>\n</body></html>`,
};

export function CodeEditor() {
  const theme = useWebOS(s => s.theme);
  const [files, setFiles] = useLocalStorage<CodeFile[]>("webos-code-files", [
    { id: "1", name: "main.js", lang: "javascript", content: TEMPLATES.javascript },
  ]);
  const [activeId, setActive] = useState<string>(files[0]?.id || "");
  const [output, setOutput] = useState("");
  const active = files.find(f => f.id === activeId);
  const editorRef = useRef<any>(null);

  useEffect(() => { if (!active && files[0]) setActive(files[0].id); }, [files, active]);

  function newFile() {
    const lang = "javascript";
    const f = { id: Math.random().toString(36).slice(2), name: `file${files.length+1}.js`, lang, content: TEMPLATES[lang] || "" };
    setFiles([...files, f]); setActive(f.id);
  }
  function update(p: Partial<CodeFile>) { if (active) setFiles(files.map(f => f.id === active.id ? {...f, ...p} : f)); }
  function run() {
    if (!active || active.lang !== "javascript") { setOutput("Run only available for JavaScript."); return; }
    const logs: string[] = [];
    const fakeConsole = { log: (...a: any[]) => logs.push(a.map(x => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" ")) };
    try { new Function("console", active.content)(fakeConsole); setOutput(logs.join("\n") || "(no output)"); }
    catch (e: any) { setOutput("Error: " + e.message); }
  }

  return (
    <div className="flex h-full bg-background">
      <div className="w-48 border-r bg-card flex flex-col">
        <div className="p-2 border-b flex gap-1">
          <Button size="sm" className="flex-1" onClick={newFile}><Plus size={12}/></Button>
        </div>
        <div className="flex-1 overflow-auto">
          {files.map(f => (
            <div key={f.id} onClick={() => setActive(f.id)} className={`px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between group ${activeId === f.id ? "bg-accent" : "hover:bg-accent/50"}`}>
              <span className="truncate">{f.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(x => x.id !== f.id)); }} className="opacity-0 group-hover:opacity-100"><Trash2 size={11}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {active && (<>
          <div className="border-b p-2 flex gap-2 items-center">
            <input value={active.name} onChange={(e) => update({ name: e.target.value })} className="bg-transparent outline-none px-2 py-1 text-sm font-medium border rounded" />
            <select value={active.lang} onChange={(e) => update({ lang: e.target.value })} className="bg-card border rounded px-2 py-1 text-sm">
              {LANGS.map(l => <option key={l}>{l}</option>)}
            </select>
            <div className="flex-1" />
            <Button size="sm" onClick={run}><Play size={12} className="mr-1"/>Run</Button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={active.lang}
              value={active.content}
              onChange={(v) => update({ content: v || "" })}
              theme={theme === "dark" ? "vs-dark" : "vs-light"}
              options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: "'JetBrains Mono', monospace" }}
              onMount={(e) => editorRef.current = e}
            />
          </div>
          {output && <div className="border-t p-2 max-h-32 overflow-auto bg-card mono text-xs whitespace-pre-wrap">{output}</div>}
        </>)}
      </div>
    </div>
  );
}
