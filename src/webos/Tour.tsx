import { useState } from "react";
import { useWebOS, setTourSeen } from "./kernel";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Welcome to WebOS", body: "A complete browser-based operating system. Everything runs locally — no servers, no tracking." },
  { title: "Launcher", body: "Click the menu icon (top-left or bottom) or press Ctrl/⌘+Space to open the app grid." },
  { title: "Command palette", body: "Press Ctrl/⌘+K to search apps and run commands instantly." },
  { title: "Window management", body: "Drag titles to move, drag edges to resize. Right-click the desktop for options. Ctrl+←/→ snaps windows." },
  { title: "Tiling mode", body: "Enable Hyprland-style auto-tiling in Settings. Windows arrange automatically in a grid." },
  { title: "Themes", body: "Switch between macOS, Windows, GNOME, or Hyprland shells in Settings → Appearance." },
  { title: "You're ready!", body: "Open Settings anytime to replay this tour. Enjoy!" },
];

export function Tour() {
  const active = useWebOS(s => s.tourActive);
  const seen = useWebOS(s => s.tourSeen);
  const [step, setStep] = useState(0);

  if (seen && !active) return null;
  if (!active && !seen) {
    return (
      <div className="fixed inset-0 z-[10400] bg-black/60 flex items-center justify-center fade-in">
        <div className="bg-card border rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to WebOS</h2>
          <p className="text-muted-foreground mb-6">Take a quick 30-second tour?</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setTourSeen(true)}>Skip</Button>
            <Button onClick={() => { useWebOS.setState({ tourActive: true }); }}>Start tour</Button>
          </div>
        </div>
      </div>
    );
  }
  if (!active) return null;

  const s = STEPS[step];
  return (
    <div className="fixed inset-0 z-[10400] bg-black/60 flex items-center justify-center fade-in">
      <div className="bg-card border rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
        </div>
        <h2 className="text-xl font-bold mb-2">{s.title}</h2>
        <p className="text-muted-foreground mb-6">{s.body}</p>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setTourSeen(true)}>Skip tour</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < STEPS.length - 1
              ? <Button onClick={() => setStep(step + 1)}>Next</Button>
              : <Button onClick={() => setTourSeen(true)}>Done</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
