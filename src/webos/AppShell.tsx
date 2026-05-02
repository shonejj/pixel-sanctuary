// Shared little helpers for apps
import { useEffect, useState } from "react";

export function AppShell({
  children,
  toolbar,
  sidebar,
}: {
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {toolbar && <div className="border-b border-border px-3 py-2 bg-card flex items-center gap-2">{toolbar}</div>}
      <div className="flex-1 flex overflow-hidden">
        {sidebar && <div className="w-56 border-r border-border bg-card overflow-auto scrollbar-thin">{sidebar}</div>}
        <div className="flex-1 overflow-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, type = "text/plain") {
  downloadBlob(new Blob([text], { type }), filename);
}
