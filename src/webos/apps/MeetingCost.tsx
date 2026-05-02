import { useState } from "react";
import { AppShell, downloadBlob } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Download } from "lucide-react";

type Attendee = { id: string; name: string; rate: number };

export function MeetingCostCalculator() {
  const [title, setTitle] = useState("Weekly Sync");
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [recurringWeekly, setRecurring] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: "1", name: "Alex", rate: 75 },
    { id: "2", name: "Jordan", rate: 90 },
    { id: "3", name: "Sam", rate: 110 },
  ]);

  const duration = hours + minutes / 60;
  const total = attendees.reduce((s, a) => s + a.rate * duration, 0);
  const perMin = total / Math.max(1, hours * 60 + minutes);
  const annual = recurringWeekly ? total * 52 : 0;

  const addAttendee = () =>
    setAttendees((a) => [...a, { id: Math.random().toString(36).slice(2), name: "", rate: 75 }]);

  const generateCard = () => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 630;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(1, "#9333ea");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "white";
    ctx.font = "bold 36px -apple-system, sans-serif";
    ctx.fillText("MEETING COST", 60, 90);
    ctx.font = "bold 56px -apple-system, sans-serif";
    ctx.fillText(title, 60, 170);
    ctx.font = "bold 140px -apple-system, sans-serif";
    ctx.fillText(`$${total.toFixed(2)}`, 60, 360);
    ctx.font = "28px -apple-system, sans-serif";
    ctx.fillText(`${attendees.length} people · ${duration.toFixed(2)}h · $${perMin.toFixed(2)}/min`, 60, 420);
    if (annual) {
      ctx.font = "32px -apple-system, sans-serif";
      ctx.fillStyle = "#fde68a";
      ctx.fillText(`Annualized: $${annual.toFixed(0)} / year`, 60, 480);
    }
    ctx.font = "20px -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Generated with WebOS · Meeting Cost Calculator", 60, 580);
    c.toBlob((b) => b && downloadBlob(b, "meeting-cost.png"));
  };

  return (
    <AppShell>
      <div className="p-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Meeting title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hours</Label>
              <Input type="number" min={0} value={hours} onChange={(e) => setHours(+e.target.value || 0)} />
            </div>
            <div>
              <Label>Minutes</Label>
              <Input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(+e.target.value || 0)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={recurringWeekly} onChange={(e) => setRecurring(e.target.checked)} />
            Recurs weekly (show annual cost)
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Attendees</Label>
              <Button size="sm" variant="outline" onClick={addAttendee}>
                <Plus size={14} /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {attendees.map((a, i) => (
                <div key={a.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={a.name}
                    onChange={(e) =>
                      setAttendees((arr) => arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="$/hour"
                    value={a.rate}
                    onChange={(e) =>
                      setAttendees((arr) => arr.map((x, j) => (j === i ? { ...x, rate: +e.target.value || 0 } : x)))
                    }
                    className="w-28"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setAttendees((arr) => arr.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white p-6 shadow-lg">
            <div className="text-xs uppercase opacity-80">Total cost</div>
            <div className="text-6xl font-bold mt-2">${total.toFixed(2)}</div>
            <div className="mt-4 text-sm opacity-90">
              {attendees.length} attendees · {duration.toFixed(2)}h · ${perMin.toFixed(2)}/min
            </div>
            {annual > 0 && (
              <div className="mt-3 text-sm bg-white/20 rounded px-3 py-2">
                Annual burn (52×): <span className="font-bold">${annual.toFixed(0)}</span>
              </div>
            )}
          </div>
          <Button onClick={generateCard} className="w-full">
            <Download size={14} className="mr-2" /> Generate shareable card (PNG)
          </Button>
          <div className="text-xs text-muted-foreground">
            All math is local. Nothing leaves your machine.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
