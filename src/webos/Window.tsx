import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  closeWindow, focusWindow, moveWindow, resizeWindow, snapWindow,
  toggleMaximize, toggleMinimize, useWebOS, type WindowState,
} from "./kernel";
import { cn } from "@/lib/utils";
import { Minus, Square, X } from "lucide-react";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function WindowFrame({ win, children }: { win: WindowState; children: ReactNode }) {
  const focusedId = useWebOS(s => s.focusedId);
  const shell = useWebOS(s => s.shell);
  const focused = focusedId === win.id;
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ edge: Edge; sx: number; sy: number; ow: number; oh: number; ox: number; oy: number; } | null>(null);
  const [snapHint, setSnapHint] = useState<"left"|"right"|"top"|null>(null);

  useEffect(() => {
    function getXY(e: MouseEvent | TouchEvent) { const t = (e as TouchEvent).touches?.[0] as any; return t ? { x: t.clientX, y: t.clientY } : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }; }
    function onMove(e: MouseEvent | TouchEvent) {
      const { x, y } = getXY(e);
      if (dragRef.current) {
        const { ox, oy, sx, sy } = dragRef.current;
        moveWindow(win.id, Math.max(0, ox + x - sx), Math.max(32, oy + y - sy));
        if (y < 8) setSnapHint("top"); else if (x < 8) setSnapHint("left"); else if (x > window.innerWidth - 8) setSnapHint("right"); else setSnapHint(null);
      } else if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = x - r.sx, dy = y - r.sy;
        let nw = r.ow, nh = r.oh, nx = r.ox, ny = r.oy;
        if (r.edge.includes("e")) nw = r.ow + dx;
        if (r.edge.includes("s")) nh = r.oh + dy;
        if (r.edge.includes("w")) { nw = r.ow - dx; nx = r.ox + dx; }
        if (r.edge.includes("n")) { nh = r.oh - dy; ny = r.oy + dy; }
        resizeWindow(win.id, nw, nh, nx, ny);
      }
    }
    function onUp() {
      if (dragRef.current && snapHint) {
        snapWindow(win.id, snapHint === "top" ? "top" : snapHint);
      }
      dragRef.current = null; resizeRef.current = null; setSnapHint(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [win.id, snapHint]);

  if (win.minimized) return null;

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (win.maximized) return;
    focusWindow(win.id);
    const t = (e as any).touches?.[0]; const x = t ? t.clientX : (e as any).clientX; const y = t ? t.clientY : (e as any).clientY;
    dragRef.current = { ox: win.x, oy: win.y, sx: x, sy: y };
  };
  const startResize = (edge: Edge) => (e: React.MouseEvent) => {
    e.stopPropagation(); focusWindow(win.id);
    resizeRef.current = { edge, sx: e.clientX, sy: e.clientY, ow: win.w, oh: win.h, ox: win.x, oy: win.y };
  };

  const isWin = shell === "windows";
  const isHypr = shell === "hyprland";

  return (
    <>
      {snapHint && (
        <div className="fixed z-[9998] bg-primary/30 border-2 border-primary pointer-events-none transition-all" style={{
          left: snapHint === "right" ? "50%" : 0,
          top: snapHint === "top" ? 32 : 32,
          width: snapHint === "top" ? "100%" : "50%",
          height: snapHint === "top" ? "calc(100% - 122px)" : "calc(100% - 122px)",
        }} />
      )}
      <div
        className={cn(
          "absolute rounded-xl overflow-hidden flex flex-col bg-card text-card-foreground window-open-anim",
          focused ? "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]" : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]",
          isHypr && (focused ? "ring-2 ring-primary" : "ring-1 ring-border"),
        )}
        style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
        onMouseDown={() => focusWindow(win.id)}
      >
        <div
          className={cn(
            "h-9 flex items-center px-2 select-none cursor-grab active:cursor-grabbing border-b border-border/60",
            focused ? "bg-secondary" : "bg-muted",
          )}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onDoubleClick={() => toggleMaximize(win.id)}
        >
          {!isWin && (
            <div className="flex gap-2 items-center">
              <button aria-label="close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-3 h-3 rounded-full bg-[var(--traffic-close)] hover:scale-110 transition" />
              <button aria-label="minimize" onClick={(e) => { e.stopPropagation(); toggleMinimize(win.id); }} className="w-3 h-3 rounded-full bg-[var(--traffic-min)] hover:scale-110 transition" />
              <button aria-label="maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} className="w-3 h-3 rounded-full bg-[var(--traffic-max)] hover:scale-110 transition" />
            </div>
          )}
          <div className={cn("flex-1 text-xs font-medium text-foreground/80 truncate px-3", isWin ? "text-left" : "text-center")}>{win.title}</div>
          {isWin && (
            <div className="flex">
              <button onClick={(e) => { e.stopPropagation(); toggleMinimize(win.id); }} className="w-9 h-9 flex items-center justify-center hover:bg-accent"><Minus size={14}/></button>
              <button onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} className="w-9 h-9 flex items-center justify-center hover:bg-accent"><Square size={12}/></button>
              <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-9 h-9 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"><X size={14}/></button>
            </div>
          )}
          {!isWin && <div className="w-12" />}
        </div>
        <div className="flex-1 overflow-hidden bg-background">{children}</div>

        {!win.maximized && (
          <>
            <div className="absolute inset-x-2 top-0 h-1 cursor-n-resize" onMouseDown={startResize("n")} />
            <div className="absolute inset-x-2 bottom-0 h-1 cursor-s-resize" onMouseDown={startResize("s")} />
            <div className="absolute inset-y-2 left-0 w-1 cursor-w-resize" onMouseDown={startResize("w")} />
            <div className="absolute inset-y-2 right-0 w-1 cursor-e-resize" onMouseDown={startResize("e")} />
            <div className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize" onMouseDown={startResize("nw")} />
            <div className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize" onMouseDown={startResize("ne")} />
            <div className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" onMouseDown={startResize("sw")} />
            <div className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" onMouseDown={startResize("se")} />
          </>
        )}
      </div>
    </>
  );
}
