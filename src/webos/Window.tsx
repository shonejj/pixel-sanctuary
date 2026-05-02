import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  closeWindow,
  focusWindow,
  moveWindow,
  resizeWindow,
  toggleMaximize,
  toggleMinimize,
  useWebOS,
  type WindowState,
} from "./kernel";
import { cn } from "@/lib/utils";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function WindowFrame({ win, children }: { win: WindowState; children: ReactNode }) {
  const focusedId = useWebOS((s) => s.focusedId);
  const focused = focusedId === win.id;
  const [animating] = useState(true);
  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{
    edge: Edge;
    sx: number;
    sy: number;
    ow: number;
    oh: number;
    ox: number;
    oy: number;
  } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (dragRef.current) {
        const { ox, oy, sx, sy } = dragRef.current;
        moveWindow(win.id, Math.max(0, ox + e.clientX - sx), Math.max(28, oy + e.clientY - sy));
      } else if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = e.clientX - r.sx;
        const dy = e.clientY - r.sy;
        let nw = r.ow,
          nh = r.oh,
          nx = r.ox,
          ny = r.oy;
        if (r.edge.includes("e")) nw = r.ow + dx;
        if (r.edge.includes("s")) nh = r.oh + dy;
        if (r.edge.includes("w")) {
          nw = r.ow - dx;
          nx = r.ox + dx;
        }
        if (r.edge.includes("n")) {
          nh = r.oh - dy;
          ny = r.oy + dy;
        }
        resizeWindow(win.id, nw, nh, nx, ny);
      }
    }
    function onUp() {
      dragRef.current = null;
      resizeRef.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [win.id]);

  if (win.minimized) return null;

  const startDrag = (e: React.MouseEvent) => {
    if (win.maximized) return;
    focusWindow(win.id);
    dragRef.current = { ox: win.x, oy: win.y, sx: e.clientX, sy: e.clientY };
  };
  const startResize = (edge: Edge) => (e: React.MouseEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
    resizeRef.current = {
      edge,
      sx: e.clientX,
      sy: e.clientY,
      ow: win.w,
      oh: win.h,
      ox: win.x,
      oy: win.y,
    };
  };

  return (
    <div
      className={cn(
        "absolute rounded-xl overflow-hidden flex flex-col bg-card text-card-foreground",
        animating && "window-open-anim",
        focused
          ? "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]"
          : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]",
      )}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title bar */}
      <div
        className={cn(
          "h-9 flex items-center px-3 select-none cursor-grab active:cursor-grabbing border-b border-border/60",
          focused ? "bg-secondary" : "bg-muted",
        )}
        onMouseDown={startDrag}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex gap-2 items-center">
          <button
            aria-label="close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="w-3 h-3 rounded-full bg-[var(--traffic-close)] hover:scale-110 transition shadow-inner"
          />
          <button
            aria-label="minimize"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize(win.id);
            }}
            className="w-3 h-3 rounded-full bg-[var(--traffic-min)] hover:scale-110 transition shadow-inner"
          />
          <button
            aria-label="maximize"
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(win.id);
            }}
            className="w-3 h-3 rounded-full bg-[var(--traffic-max)] hover:scale-110 transition shadow-inner"
          />
        </div>
        <div className="flex-1 text-center text-xs font-medium text-foreground/80 truncate px-3">
          {win.title}
        </div>
        <div className="w-12" />
      </div>
      {/* Body */}
      <div className="flex-1 overflow-hidden bg-background">{children}</div>

      {/* Resize handles */}
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
  );
}
