import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, ExternalLink, Loader2 } from "lucide-react";

// WordPress Playground runs a full WordPress + PHP + SQLite stack in WebAssembly,
// served from playground.wordpress.net.
export function WordPressApp() {
  const [k, setK] = useState(0);
  const [loading, setLoading] = useState(true);
  const url = "https://playground.wordpress.net/?mode=seamless&storage=browser";
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#21759b] text-white text-[11px] flex items-center justify-center font-bold">W</div>
        <span className="font-medium text-sm">WordPress Playground</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">Full WP + PHP in WASM</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setLoading(true); setK((x) => x + 1); }}><RotateCw size={14} className="mr-1"/>Reload</Button>
          <a href={url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><ExternalLink size={14} className="mr-1"/>Open</Button></a>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-2 text-[#21759b]"/>
              <div className="text-sm font-medium">Booting WordPress…</div>
              <div className="text-xs text-muted-foreground">PHP + SQLite + WordPress 6 — all in your browser</div>
            </div>
          </div>
        )}
        <iframe key={k} src={url} className="w-full h-full border-0" onLoad={() => setLoading(false)}
          allow="cross-origin-isolated" sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-modals allow-downloads"/>
      </div>
    </div>
  );
}
