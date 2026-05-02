import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CITIES: { name: string; tz: string }[] = [
  { name: "New York", tz: "America/New_York" },
  { name: "Los Angeles", tz: "America/Los_Angeles" },
  { name: "Chicago", tz: "America/Chicago" },
  { name: "London", tz: "Europe/London" },
  { name: "Paris", tz: "Europe/Paris" },
  { name: "Berlin", tz: "Europe/Berlin" },
  { name: "Dubai", tz: "Asia/Dubai" },
  { name: "Mumbai", tz: "Asia/Kolkata" },
  { name: "Singapore", tz: "Asia/Singapore" },
  { name: "Tokyo", tz: "Asia/Tokyo" },
  { name: "Shanghai", tz: "Asia/Shanghai" },
  { name: "Sydney", tz: "Australia/Sydney" },
  { name: "São Paulo", tz: "America/Sao_Paulo" },
  { name: "Lagos", tz: "Africa/Lagos" },
  { name: "Toronto", tz: "America/Toronto" },
];

export function TimezonePlanner() {
  const [picked, setPicked] = useState([CITIES[0], CITIES[3], CITIES[9]]);
  const [q, setQ] = useState("");
  const [meeting, setMeeting] = useState({ start: 14, len: 1 }); // UTC hours
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const matches = useMemo(
    () => CITIES.filter((c) => !picked.includes(c) && c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6),
    [q, picked],
  );

  function getUtcOffsetHours(tz: string): number {
    const d = new Date();
    const local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
    const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
    return (local.getTime() - utc.getTime()) / 3600000;
  }

  const nowUtc = now.getUTCHours() + now.getUTCMinutes() / 60;

  return (
    <AppShell>
      <div className="p-6 space-y-4">
        <div className="relative max-w-md">
          <Input placeholder="Add city…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && matches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow">
              {matches.map((c) => (
                <button
                  key={c.tz}
                  className="w-full text-left px-3 py-1.5 hover:bg-accent text-sm"
                  onClick={() => { setPicked([...picked, c]); setQ(""); }}
                >
                  {c.name} <span className="text-xs text-muted-foreground">{c.tz}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-4 overflow-x-auto">
          <div className="relative" style={{ minWidth: 720 }}>
            {/* hour ticks */}
            <div className="grid grid-cols-24 text-[10px] text-muted-foreground" style={{ gridTemplateColumns: "120px repeat(24, 1fr)" }}>
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-center border-l border-border/50">{h}</div>
              ))}
            </div>
            {/* meeting overlay */}
            <div className="relative h-3 mt-1" style={{ marginLeft: 120 }}>
              <div
                className="absolute top-0 h-full bg-emerald-500/40 border border-emerald-500 rounded"
                style={{ left: `${(meeting.start / 24) * 100}%`, width: `${(meeting.len / 24) * 100}%` }}
              />
              <div className="absolute top-0 h-full w-px bg-destructive" style={{ left: `${(nowUtc / 24) * 100}%` }} />
            </div>
            {picked.map((c) => {
              const off = getUtcOffsetHours(c.tz);
              const businessStartUtc = (9 - off + 24) % 24;
              const businessEndUtc = (17 - off + 24) % 24;
              return (
                <div key={c.tz} className="grid items-center my-2" style={{ gridTemplateColumns: "120px 1fr" }}>
                  <div className="text-sm flex items-center gap-1">
                    <span>{c.name}</span>
                    <button onClick={() => setPicked(picked.filter((x) => x !== c))} className="text-muted-foreground hover:text-destructive">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="relative h-6 bg-muted rounded">
                    {renderBusinessBars(businessStartUtc, businessEndUtc)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm font-semibold mb-2">Meeting window (UTC)</div>
          <div className="flex items-center gap-3 text-sm">
            <label>Start (UTC h):</label>
            <input type="range" min={0} max={23} value={meeting.start} onChange={(e) => setMeeting({ ...meeting, start: +e.target.value })} className="flex-1" />
            <span className="tabular-nums w-8">{meeting.start}:00</span>
            <label>Hours:</label>
            <input type="number" min={0.5} step={0.5} max={6} value={meeting.len} onChange={(e) => setMeeting({ ...meeting, len: +e.target.value })} className="w-20 h-8 px-2 border rounded bg-background" />
          </div>
          <div className="mt-3 text-sm">
            {picked.map((c) => {
              const off = getUtcOffsetHours(c.tz);
              const localH = (meeting.start + off + 24) % 24;
              const works = localH >= 9 && localH + meeting.len <= 17;
              return (
                <div key={c.tz} className={`flex justify-between py-1 ${works ? "text-emerald-500" : "text-destructive"}`}>
                  <span>{c.name}</span>
                  <span className="mono">{fmt(localH)} – {fmt(localH + meeting.len)} {works ? "✓" : "✗ outside business hours"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function renderBusinessBars(start: number, end: number) {
  // start/end in UTC hours; bar spans 0..24
  if (start < end) {
    return (
      <div
        className="absolute top-0 h-full bg-primary/60 rounded"
        style={{ left: `${(start / 24) * 100}%`, width: `${((end - start) / 24) * 100}%` }}
      />
    );
  }
  return (
    <>
      <div className="absolute top-0 h-full bg-primary/60 rounded" style={{ left: `${(start / 24) * 100}%`, width: `${((24 - start) / 24) * 100}%` }} />
      <div className="absolute top-0 h-full bg-primary/60 rounded" style={{ left: 0, width: `${(end / 24) * 100}%` }} />
    </>
  );
}

function fmt(h: number) {
  const hh = Math.floor((h + 24) % 24);
  const mm = Math.round((h - Math.floor(h)) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}
