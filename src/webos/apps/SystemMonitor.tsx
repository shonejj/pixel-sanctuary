import { useEffect, useState } from "react";
import { useWebOS } from "../kernel";
import { Cpu, HardDrive, Wifi, MemoryStick } from "lucide-react";

function fmt(n: number) { return n.toFixed(1); }

export function SystemMonitor() {
  const windows = useWebOS((s) => s.windows);
  const apps = useWebOS((s) => s.apps);
  const [fps, setFps] = useState(60);
  const [mem, setMem] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [net, setNet] = useState<any>(null);

  useEffect(() => {
    let frames = 0, last = performance.now(), raf: number;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) { setFps(frames); frames = 0; last = now; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const t = setInterval(async () => {
      // @ts-ignore
      if (performance.memory) setMem(performance.memory);
      if (navigator.storage?.estimate) setStorage(await navigator.storage.estimate());
      // @ts-ignore
      setNet(navigator.connection || null);
    }, 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(t); };
  }, []);

  const usedMB = mem ? mem.usedJSHeapSize / 1048576 : 0;
  const totalMB = mem ? mem.jsHeapSizeLimit / 1048576 : 0;
  const stGB = storage ? (storage.usage || 0) / 1073741824 : 0;
  const stQuotaGB = storage ? (storage.quota || 0) / 1073741824 : 0;

  return (
    <div className="p-4 h-full overflow-auto scrollbar-thin space-y-4 bg-background">
      <h2 className="text-lg font-bold">System Monitor</h2>
      <div className="grid grid-cols-2 gap-3">
        <Card icon={<Cpu className="text-blue-500"/>} title="FPS" value={`${fps}`} sub="frames/sec" />
        <Card icon={<MemoryStick className="text-green-500"/>} title="Memory" value={mem ? `${fmt(usedMB)} MB` : "n/a"} sub={mem ? `of ${fmt(totalMB)} MB` : "Chrome only"} bar={mem ? usedMB / totalMB : 0}/>
        <Card icon={<HardDrive className="text-purple-500"/>} title="Storage" value={storage ? `${fmt(stGB)} GB` : "n/a"} sub={storage ? `of ${fmt(stQuotaGB)} GB` : "—"} bar={storage ? stGB / stQuotaGB : 0}/>
        <Card icon={<Wifi className="text-orange-500"/>} title="Network" value={net?.effectiveType?.toUpperCase() || "online"} sub={net ? `${net.downlink ?? "?"} Mbps · RTT ${net.rtt ?? "?"}` : "online"}/>
      </div>
      <div>
        <h3 className="font-medium mb-2 text-sm">Running apps ({windows.length})</h3>
        <div className="space-y-1">
          {windows.length === 0 && <div className="text-xs text-muted-foreground">No open windows.</div>}
          {windows.map((w) => (
            <div key={w.id} className="flex items-center gap-2 px-2 py-1.5 border rounded text-xs">
              <span className="w-5 h-5 inline-flex items-center justify-center">{apps[w.appId]?.icon}</span>
              <span className="flex-1 truncate">{w.title}</span>
              <span className="text-muted-foreground mono">{w.w}×{w.h}</span>
              {w.minimized && <span className="text-yellow-500">min</span>}
              {w.maximized && <span className="text-green-500">max</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Total registered apps: <b>{Object.keys(apps).length}</b> · User agent: <span className="mono">{navigator.userAgent.slice(0, 80)}…</span>
      </div>
    </div>
  );
}

function Card({ icon, title, value, sub, bar }: any) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">{icon}{title}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
      {bar !== undefined && <div className="mt-2 h-1.5 bg-muted rounded overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, bar * 100)}%` }}/></div>}
    </div>
  );
}
