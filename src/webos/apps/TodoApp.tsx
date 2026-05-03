import { useState } from "react";
import { AppShell, useLocalStorage } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";

type Todo = { id: string; text: string; done: boolean; created: number };

export function TodoApp() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("webos-todos", []);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  function add() {
    if (!text.trim()) return;
    setTodos([{ id: Math.random().toString(36).slice(2), text: text.trim(), done: false, created: Date.now() }, ...todos]);
    setText("");
  }

  const filtered = todos.filter(t => filter === "all" || (filter === "done" ? t.done : !t.done));

  return (
    <AppShell>
      <div className="p-4 max-w-2xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        <div className="flex gap-2 mb-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a task…" />
          <Button onClick={add}><Plus size={16} /></Button>
        </div>
        <div className="flex gap-2 mb-3 text-sm">
          {(["all","active","done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{f}</button>
          ))}
          <span className="ml-auto text-muted-foreground">{todos.filter(t => !t.done).length} left</span>
        </div>
        <div className="flex-1 overflow-auto space-y-1.5">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center gap-2 p-2 bg-card border rounded-lg group">
              <button onClick={() => setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${t.done ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {t.done && <Check size={12} className="text-primary-foreground" />}
              </button>
              <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
              <button onClick={() => setTodos(todos.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          ))}
          {!filtered.length && <div className="text-center text-muted-foreground p-8">No tasks</div>}
        </div>
      </div>
    </AppShell>
  );
}
