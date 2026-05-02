// WebOS Kernel - global app registry, window/state management, theme, clipboard, notifications
import { create } from "./store-mini";
import type { ComponentType, ReactNode } from "react";

export type AppDef = {
  id: string;
  name: string;
  icon: ReactNode;
  category: "productivity" | "developer" | "design" | "system" | "lifestyle";
  defaultWidth?: number;
  defaultHeight?: number;
  singleton?: boolean;
  Component: ComponentType<{ windowId: string; params?: any }>;
  accent?: string; // tailwind-friendly color hint
};

export type WindowState = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: { x: number; y: number; w: number; h: number };
  params?: any;
};

export type Notif = { id: string; title: string; body?: string; ts: number };

type State = {
  apps: Record<string, AppDef>;
  windows: WindowState[];
  focusedId: string | null;
  zCounter: number;
  theme: "light" | "dark";
  wallpaper: string; // 'default' or dataUrl
  notifications: Notif[];
  clipboardHistory: string[];
  desktopIcons: { appId: string; x: number; y: number }[];
};

export const useWebOS = create<State>(() => ({
  apps: {},
  windows: [],
  focusedId: null,
  zCounter: 10,
  theme: (typeof window !== "undefined" && (localStorage.getItem("webos-theme") as any)) || "dark",
  wallpaper: (typeof window !== "undefined" && localStorage.getItem("webos-wallpaper")) || "default",
  notifications: [],
  clipboardHistory: [],
  desktopIcons: [],
}));

// ---- App registry ----
export function registerApp(app: AppDef) {
  useWebOS.setState((s) => ({ apps: { ...s.apps, [app.id]: app } }));
}

// ---- Window lifecycle ----
function nextPos(idx: number) {
  const baseX = 120 + (idx % 6) * 30;
  const baseY = 70 + (idx % 6) * 30;
  return { x: baseX, y: baseY };
}

export function launchApp(appId: string, params?: any) {
  const s = useWebOS.getState();
  const app = s.apps[appId];
  if (!app) return;
  if (app.singleton) {
    const existing = s.windows.find((w) => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      if (existing.minimized) toggleMinimize(existing.id);
      return;
    }
  }
  const w = app.defaultWidth ?? 880;
  const h = app.defaultHeight ?? 600;
  const { x, y } = nextPos(s.windows.length);
  const id = `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const z = s.zCounter + 1;
  useWebOS.setState({
    windows: [
      ...s.windows,
      { id, appId, title: app.name, x, y, w, h, z, minimized: false, maximized: false, params },
    ],
    focusedId: id,
    zCounter: z,
  });
}

export function closeWindow(id: string) {
  useWebOS.setState((s) => ({
    windows: s.windows.filter((w) => w.id !== id),
    focusedId: s.focusedId === id ? null : s.focusedId,
  }));
}

export function focusWindow(id: string) {
  useWebOS.setState((s) => {
    const z = s.zCounter + 1;
    return {
      focusedId: id,
      zCounter: z,
      windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
    };
  });
}

export function toggleMinimize(id: string) {
  useWebOS.setState((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)),
    focusedId: s.focusedId === id ? null : s.focusedId,
  }));
}

export function toggleMaximize(id: string) {
  useWebOS.setState((s) => ({
    windows: s.windows.map((w) => {
      if (w.id !== id) return w;
      if (w.maximized && w.prev) {
        return { ...w, maximized: false, ...w.prev, prev: undefined };
      }
      return {
        ...w,
        maximized: true,
        prev: { x: w.x, y: w.y, w: w.w, h: w.h },
        x: 0,
        y: 28,
        w: window.innerWidth,
        h: window.innerHeight - 28 - 88,
      };
    }),
  }));
}

export function moveWindow(id: string, x: number, y: number) {
  useWebOS.setState((s) => ({
    windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
  }));
}

export function resizeWindow(id: string, w: number, h: number, x?: number, y?: number) {
  useWebOS.setState((s) => ({
    windows: s.windows.map((win) =>
      win.id === id
        ? { ...win, w: Math.max(320, w), h: Math.max(240, h), x: x ?? win.x, y: y ?? win.y }
        : win,
    ),
  }));
}

// ---- Theme ----
export function setTheme(theme: "light" | "dark") {
  useWebOS.setState({ theme });
  localStorage.setItem("webos-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// ---- Wallpaper ----
export function setWallpaper(w: string) {
  useWebOS.setState({ wallpaper: w });
  localStorage.setItem("webos-wallpaper", w);
}

// ---- Notifications ----
export function notify(title: string, body?: string) {
  const n: Notif = { id: Math.random().toString(36).slice(2), title, body, ts: Date.now() };
  useWebOS.setState((s) => ({ notifications: [...s.notifications, n] }));
  setTimeout(() => {
    useWebOS.setState((s) => ({ notifications: s.notifications.filter((x) => x.id !== n.id) }));
  }, 5000);
}

export function dismissNotif(id: string) {
  useWebOS.setState((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) }));
}

// ---- Clipboard ----
export function pushClipboard(text: string) {
  if (!text) return;
  useWebOS.setState((s) => ({
    clipboardHistory: [text, ...s.clipboardHistory.filter((t) => t !== text)].slice(0, 20),
  }));
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ---- Persistence: settings + desktop icons ----
export function initPersistence() {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", useWebOS.getState().theme === "dark");
  const saved = localStorage.getItem("webos-icons");
  if (saved) {
    try {
      useWebOS.setState({ desktopIcons: JSON.parse(saved) });
    } catch {}
  }
  useWebOS.subscribe((s) => {
    localStorage.setItem("webos-icons", JSON.stringify(s.desktopIcons));
  });
}

export function setDesktopIcons(icons: { appId: string; x: number; y: number }[]) {
  useWebOS.setState({ desktopIcons: icons });
}
