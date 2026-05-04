// WebOS Kernel
import { create } from "./store-mini";
import type { ComponentType, ReactNode } from "react";

export type ShellTheme = "macos" | "windows" | "gnome" | "hyprland";
export type AppCategory = "tech" | "productivity" | "lifestyle" | "creative" | "system";
export type UiStyle = "glass" | "material" | "cartoon" | "japanese" | "neumorphic" | "flat";

export type AppDef = {
  id: string;
  name: string;
  icon: ReactNode;
  category: AppCategory;
  defaultWidth?: number;
  defaultHeight?: number;
  singleton?: boolean;
  Component: ComponentType<{ windowId: string; params?: any }>;
  accent?: string;
  tags?: string[];
  custom?: boolean;
  customMode?: "html" | "url";
  customSource?: string;
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
  tile?: "left" | "right" | "top" | "bottom" | null;
};

export type Notif = { id: string; title: string; body?: string; ts: number };

type State = {
  apps: Record<string, AppDef>;
  windows: WindowState[];
  focusedId: string | null;
  zCounter: number;
  theme: "light" | "dark";
  shell: ShellTheme;
  accentHue: number;
  wallpaper: string;
  notifications: Notif[];
  clipboardHistory: string[];
  desktopIcons: { appId: string; x: number; y: number }[];
  customApps: AppDef[];
  booted: boolean;
  tourSeen: boolean;
  tourActive: boolean;
  paletteOpen: boolean;
  launcherOpen: boolean;
  startMenuOpen: boolean;
  settingsOpen: boolean;
  tilingMode: boolean;
};

function ls(k: string, d: any) {
  if (typeof window === "undefined") return d;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
}

export const useWebOS = create<State>(() => ({
  apps: {},
  windows: [],
  focusedId: null,
  zCounter: 10,
  theme: ls("webos-theme", "dark"),
  shell: ls("webos-shell", "macos"),
  accentHue: ls("webos-hue", 265),
  wallpaper: ls("webos-wallpaper", "aurora"),
  notifications: [],
  clipboardHistory: [],
  desktopIcons: [],
  customApps: ls("webos-custom-apps-meta", []),
  booted: false,
  tourSeen: ls("webos-tour-seen", false),
  tourActive: false,
  paletteOpen: false,
  launcherOpen: false,
  startMenuOpen: false,
  settingsOpen: false,
  tilingMode: ls("webos-tiling", false),
}));

export function registerApp(app: AppDef) {
  useWebOS.setState((s) => ({ apps: { ...s.apps, [app.id]: app } }));
}
export function unregisterApp(id: string) {
  useWebOS.setState((s) => {
    const { [id]: _, ...rest } = s.apps;
    return { apps: rest, windows: s.windows.filter((w) => w.appId !== id) };
  });
}

function viewport() {
  return { vw: window.innerWidth, vh: window.innerHeight };
}
function isMobile() { return typeof window !== "undefined" && window.innerWidth < 768; }

export function launchApp(appId: string, params?: any) {
  const s = useWebOS.getState();
  const app = s.apps[appId];
  if (!app) return;
  if (app.singleton) {
    const existing = s.windows.find((w) => w.appId === appId);
    if (existing) { focusWindow(existing.id); if (existing.minimized) toggleMinimize(existing.id); return; }
  }
  const mobile = isMobile();
  const { vw, vh } = viewport();
  let w = app.defaultWidth ?? 880, h = app.defaultHeight ?? 600;
  let x = 80 + (s.windows.length % 6) * 30, y = 60 + (s.windows.length % 6) * 30;
  let maximized = false;
  if (mobile) { w = vw; h = vh - 100; x = 0; y = 32; maximized = true; }
  else { w = Math.min(w, vw - 40); h = Math.min(h, vh - 140); }
  const id = `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const z = s.zCounter + 1;
  useWebOS.setState({
    windows: [...s.windows, { id, appId, title: app.name, x, y, w, h, z, minimized: false, maximized, params }],
    focusedId: id, zCounter: z, launcherOpen: false, startMenuOpen: false, paletteOpen: false,
  });
  if (s.tilingMode) retile();
}

export function closeWindow(id: string) {
  useWebOS.setState((s) => ({
    windows: s.windows.filter((w) => w.id !== id),
    focusedId: s.focusedId === id ? null : s.focusedId,
  }));
  if (useWebOS.getState().tilingMode) retile();
}
export function closeAllWindows() { useWebOS.setState({ windows: [], focusedId: null }); }
export function minimizeAll() {
  useWebOS.setState((s) => ({ windows: s.windows.map((w) => ({ ...w, minimized: true })), focusedId: null }));
}

export function focusWindow(id: string) {
  useWebOS.setState((s) => {
    const z = s.zCounter + 1;
    return { focusedId: id, zCounter: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)) };
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
      if (w.maximized && w.prev) return { ...w, maximized: false, ...w.prev, prev: undefined, tile: null };
      return { ...w, maximized: true, prev: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 32, w: window.innerWidth, h: window.innerHeight - 32 - 90, tile: null };
    }),
  }));
}

export function snapWindow(id: string, side: "left" | "right" | "top" | "bottom") {
  const { vw, vh } = viewport();
  const top = 32, bottom = 90;
  const usable = vh - top - bottom;
  useWebOS.setState((s) => ({
    windows: s.windows.map((w) => {
      if (w.id !== id) return w;
      const prev = w.prev || { x: w.x, y: w.y, w: w.w, h: w.h };
      if (side === "left") return { ...w, prev, tile: side, maximized: false, x: 0, y: top, w: vw / 2, h: usable };
      if (side === "right") return { ...w, prev, tile: side, maximized: false, x: vw / 2, y: top, w: vw / 2, h: usable };
      if (side === "top") return { ...w, prev, tile: side, maximized: false, x: 0, y: top, w: vw, h: usable / 2 };
      return { ...w, prev, tile: side, maximized: false, x: 0, y: top + usable / 2, w: vw, h: usable / 2 };
    }),
  }));
}

export function retile() {
  const s = useWebOS.getState();
  const visible = s.windows.filter((w) => !w.minimized);
  if (!visible.length) return;
  const { vw, vh } = viewport();
  const top = 32, bottom = 90;
  const usable = vh - top - bottom;
  const cols = Math.ceil(Math.sqrt(visible.length));
  const rows = Math.ceil(visible.length / cols);
  const cw = vw / cols, ch = usable / rows;
  const map = new Map(visible.map((w, i) => [w.id, { x: (i % cols) * cw, y: top + Math.floor(i / cols) * ch, w: cw, h: ch }]));
  useWebOS.setState({
    windows: s.windows.map((w) => map.has(w.id) ? { ...w, ...map.get(w.id)!, maximized: false } : w),
  });
}

export function setTilingMode(v: boolean) {
  useWebOS.setState({ tilingMode: v });
  localStorage.setItem("webos-tiling", JSON.stringify(v));
  if (v) retile();
}

export function moveWindow(id: string, x: number, y: number) {
  useWebOS.setState((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y, tile: null } : w)) }));
}
export function resizeWindow(id: string, w: number, h: number, x?: number, y?: number) {
  useWebOS.setState((s) => ({
    windows: s.windows.map((win) => win.id === id ? { ...win, w: Math.max(280, w), h: Math.max(200, h), x: x ?? win.x, y: y ?? win.y } : win),
  }));
}

export function setTheme(theme: "light" | "dark") {
  useWebOS.setState({ theme });
  localStorage.setItem("webos-theme", JSON.stringify(theme));
  document.documentElement.classList.toggle("dark", theme === "dark");
}
export function setShell(shell: ShellTheme) {
  useWebOS.setState({ shell });
  localStorage.setItem("webos-shell", JSON.stringify(shell));
  document.documentElement.dataset.shell = shell;
}
export function setAccentHue(h: number) {
  useWebOS.setState({ accentHue: h });
  localStorage.setItem("webos-hue", JSON.stringify(h));
  document.documentElement.style.setProperty("--accent-hue", String(h));
}
export function setWallpaper(w: string) {
  useWebOS.setState({ wallpaper: w });
  localStorage.setItem("webos-wallpaper", JSON.stringify(w));
}

export function notify(title: string, body?: string) {
  const n: Notif = { id: Math.random().toString(36).slice(2), title, body, ts: Date.now() };
  useWebOS.setState((s) => ({ notifications: [...s.notifications, n] }));
  setTimeout(() => useWebOS.setState((s) => ({ notifications: s.notifications.filter((x) => x.id !== n.id) })), 5000);
}
export function dismissNotif(id: string) {
  useWebOS.setState((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) }));
}

export function pushClipboard(text: string) {
  if (!text) return;
  useWebOS.setState((s) => ({ clipboardHistory: [text, ...s.clipboardHistory.filter((t) => t !== text)].slice(0, 20) }));
  navigator.clipboard?.writeText(text).catch(() => {});
}

export function setBooted(v: boolean) { useWebOS.setState({ booted: v }); }
export function setTourSeen(v: boolean) {
  useWebOS.setState({ tourSeen: v, tourActive: false });
  localStorage.setItem("webos-tour-seen", JSON.stringify(v));
}
export function startTour() { useWebOS.setState({ tourActive: true }); }
export function setPalette(v: boolean) { useWebOS.setState({ paletteOpen: v }); }
export function setLauncher(v: boolean) { useWebOS.setState({ launcherOpen: v, startMenuOpen: false }); }
export function setStartMenu(v: boolean) { useWebOS.setState({ startMenuOpen: v, launcherOpen: false }); }
export function setSettings(v: boolean) { useWebOS.setState({ settingsOpen: v }); }

export function addCustomApp(meta: Omit<AppDef, "Component" | "icon"> & { iconText?: string }) {
  const list = [...useWebOS.getState().customApps, meta as any];
  useWebOS.setState({ customApps: list });
  localStorage.setItem("webos-custom-apps-meta", JSON.stringify(list.map((a) => ({
    id: a.id, name: a.name, category: a.category, custom: true,
    customMode: a.customMode, customSource: a.customSource, accent: a.accent,
  }))));
}
export function removeCustomApp(id: string) {
  const list = useWebOS.getState().customApps.filter((a) => a.id !== id);
  useWebOS.setState({ customApps: list });
  localStorage.setItem("webos-custom-apps-meta", JSON.stringify(list));
  unregisterApp(id);
}

export function initPersistence() {
  if (typeof window === "undefined") return;
  const s = useWebOS.getState();
  document.documentElement.classList.toggle("dark", s.theme === "dark");
  document.documentElement.dataset.shell = s.shell;
  document.documentElement.style.setProperty("--accent-hue", String(s.accentHue));
  const saved = localStorage.getItem("webos-icons");
  if (saved) { try { useWebOS.setState({ desktopIcons: JSON.parse(saved) }); } catch {} }
  useWebOS.subscribe((st) => { localStorage.setItem("webos-icons", JSON.stringify(st.desktopIcons)); });
  window.addEventListener("resize", () => { if (useWebOS.getState().tilingMode) retile(); });
}

export function setDesktopIcons(icons: { appId: string; x: number; y: number }[]) {
  useWebOS.setState({ desktopIcons: icons });
}
