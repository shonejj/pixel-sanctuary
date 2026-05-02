import { useEffect } from "react";
import { initPersistence, registerApp, useWebOS } from "./kernel";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowFrame } from "./Window";
import { NotificationCenter } from "./NotificationCenter";
import { ALL_APPS } from "./apps";

export function Desktop() {
  const windows = useWebOS((s) => s.windows);
  const apps = useWebOS((s) => s.apps);

  useEffect(() => {
    initPersistence();
    ALL_APPS.forEach(registerApp);
  }, []);

  return (
    <div className="fixed inset-0 desktop-wallpaper overflow-hidden">
      <MenuBar />
      <NotificationCenter />

      {/* Windows layer */}
      <div className="absolute inset-0 pt-7 pb-20">
        {windows.map((w) => {
          const App = apps[w.appId]?.Component;
          if (!App) return null;
          return (
            <WindowFrame key={w.id} win={w}>
              <App windowId={w.id} params={w.params} />
            </WindowFrame>
          );
        })}
      </div>

      <Dock />

      {windows.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/80">
            <div className="text-5xl font-bold tracking-tight drop-shadow-lg">WebOS</div>
            <div className="text-sm mt-2 opacity-80">Click an app in the dock to begin · 100% local · zero servers</div>
          </div>
        </div>
      )}
    </div>
  );
}
