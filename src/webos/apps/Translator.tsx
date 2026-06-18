import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Volume2, Copy, Loader2 } from "lucide-react";
import { pushClipboard } from "../kernel";

const LANGS: Record<string, string> = {
  auto: "Auto-detect", en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean", ar: "Arabic",
  hi: "Hindi", nl: "Dutch", sv: "Swedish", tr: "Turkish", pl: "Polish",
};

export function Translator() {
  const [src, setSrc] = useState("");
  const [out, setOut] = useState("");
  const [from, setFrom] = useState("auto");
  const [to, setTo] = useState("en");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!src.trim()) { setOut(""); return; }
    const id = setTimeout(async () => {
      setBusy(true); setErr(null);
      try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(src)}&langpair=${from === "auto" ? "" : from}|${to}`);
        const j = await r.json();
        setOut(j.responseData?.translatedText || "");
      } catch (e: any) { setErr("Translation failed"); }
      setBusy(false);
    }, 500);
    return () => clearTimeout(id);
  }, [src, from, to]);

  function speak(text: string, lang: string) {
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    speechSynthesis.speak(u);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b p-2 flex items-center gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="text-xs border rounded px-2 py-1 bg-card flex-1">
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={() => { const t = from; setFrom(to === "auto" ? "en" : to); setTo(t === "auto" ? "en" : t); setSrc(out); }}>
          <ArrowRightLeft size={14}/>
        </Button>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="text-xs border rounded px-2 py-1 bg-card flex-1">
          {Object.entries(LANGS).filter(([k]) => k !== "auto").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="flex-1 grid grid-rows-2 sm:grid-rows-none sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
        <div className="flex flex-col">
          <textarea value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Type to translate…"
            className="flex-1 p-3 bg-transparent outline-none resize-none"/>
          <div className="flex justify-end gap-1 p-1.5 border-t">
            <Button size="sm" variant="ghost" onClick={() => speak(src, from === "auto" ? "en" : from)}><Volume2 size={12}/></Button>
          </div>
        </div>
        <div className="flex flex-col bg-muted/30">
          <div className="flex-1 p-3 overflow-auto whitespace-pre-wrap">
            {busy ? <Loader2 size={16} className="animate-spin"/> : err ? <span className="text-red-500 text-xs">{err}</span> : out}
          </div>
          <div className="flex justify-end gap-1 p-1.5 border-t">
            <Button size="sm" variant="ghost" onClick={() => speak(out, to)}><Volume2 size={12}/></Button>
            <Button size="sm" variant="ghost" onClick={() => pushClipboard(out)}><Copy size={12}/></Button>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground text-center py-1 border-t">Powered by MyMemory · free translation API</div>
    </div>
  );
}
