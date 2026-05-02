import { launchApp, useWebOS } from "./kernel";
import { cn } from "@/lib/utils";

export function Dock() {
  const apps = useWebOS((s) => s.apps);
  const windows = useWebOS((s) => s.windows);
  const ordered = Object.values(apps).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="glass rounded-2xl px-3 py-2 flex items-end gap-1.5 shadow-2xl">
        {ordered.map((app) => {
          const running = windows.some((w) => w.appId === app.id);
          return (
            <button
              key={app.id}
              title={app.name}
              onClick={() => launchApp(app.id)}
              className="group relative flex flex-col items-center"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150",
                  "bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur",
                  "border border-white/10 shadow-md",
                  "group-hover:scale-125 group-hover:-translate-y-2",
                )}
                style={{ background: app.accent }}
              >
                <div className="text-white drop-shadow">{app.icon}</div>
              </div>
              <span
                className={cn(
                  "absolute -bottom-1 w-1 h-1 rounded-full bg-foreground transition-opacity",
                  running ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="absolute -top-9 px-2 py-1 text-[11px] rounded-md bg-popover text-popover-foreground border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
