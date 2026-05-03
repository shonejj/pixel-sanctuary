import { useState } from "react";
import { addDays, format, startOfMonth, startOfWeek, isSameDay, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "../AppShell";

type Event = { id: string; date: string; title: string };

export function CalendarApp() {
  const [month, setMonth] = useState(new Date());
  const [sel, setSel] = useState(new Date());
  const [events, setEvents] = useLocalStorage<Event[]>("webos-events", []);
  const [title, setTitle] = useState("");

  const start = startOfWeek(startOfMonth(month));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));

  function add() {
    if (!title.trim()) return;
    setEvents([...events, { id: Math.random().toString(36).slice(2), date: format(sel, "yyyy-MM-dd"), title: title.trim() }]);
    setTitle("");
  }
  const dayEvents = events.filter(e => e.date === format(sel, "yyyy-MM-dd"));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-full bg-background">
      <div className="md:col-span-2 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">{format(month, "MMMM yyyy")}</h2>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" onClick={() => setMonth(addDays(month, -30))}><ChevronLeft size={16}/></Button>
            <Button size="sm" variant="outline" onClick={() => { setMonth(new Date()); setSel(new Date()); }}>Today</Button>
            <Button size="icon" variant="outline" onClick={() => setMonth(addDays(month, 30))}><ChevronRight size={16}/></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground mb-1">
          {["S","M","T","W","T","F","S"].map((d,i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => (
            <button key={d.toISOString()} onClick={() => setSel(d)} className={`aspect-square rounded-lg text-sm relative ${isSameDay(d, sel) ? "bg-primary text-primary-foreground" : isSameMonth(d, month) ? "hover:bg-accent" : "text-muted-foreground/50"}`}>
              {format(d, "d")}
              {events.some(e => e.date === format(d, "yyyy-MM-dd")) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />}
            </button>
          ))}
        </div>
      </div>
      <div className="border-l p-4">
        <h3 className="font-bold mb-2">{format(sel, "EEEE, MMM d")}</h3>
        <div className="flex gap-2 mb-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Event…" />
          <Button onClick={add}><Plus size={14}/></Button>
        </div>
        <div className="space-y-1">
          {dayEvents.length === 0 && <div className="text-sm text-muted-foreground">No events</div>}
          {dayEvents.map(e => (
            <div key={e.id} className="p-2 bg-card border rounded flex justify-between items-center">
              <span className="text-sm">{e.title}</span>
              <button onClick={() => setEvents(events.filter(x => x.id !== e.id))} className="text-xs text-destructive">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
