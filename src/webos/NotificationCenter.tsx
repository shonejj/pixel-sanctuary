import { dismissNotif, useWebOS } from "./kernel";
import { X } from "lucide-react";

export function NotificationCenter() {
  const list = useWebOS((s) => s.notifications);
  return (
    <div className="fixed top-10 right-4 z-[10001] flex flex-col gap-2 w-80">
      {list.map((n) => (
        <div
          key={n.id}
          className="glass rounded-lg p-3 shadow-xl animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="text-sm font-semibold">{n.title}</div>
              {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
            </div>
            <button onClick={() => dismissNotif(n.id)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
