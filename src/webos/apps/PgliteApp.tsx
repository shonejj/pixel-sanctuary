import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Database, Loader2, Download, Trash2 } from "lucide-react";
import { downloadText } from "../AppShell";

const SAMPLE = `-- Welcome to PGlite — a full Postgres running in your browser (WASM).
-- Data is persisted in IndexedDB.
CREATE TABLE IF NOT EXISTS notes (
  id   SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO notes (body) VALUES ('Hello from Postgres!'), ('PGlite is amazing');

SELECT * FROM notes ORDER BY id;`;

export function PgliteApp() {
  const [sql, setSql] = useState(SAMPLE);
  const [rows, setRows] = useState<any[] | null>(null);
  const [cols, setCols] = useState<string[]>([]);
  const [log, setLog] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const dbRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      dbRef.current = new PGlite("idb://webos-pglite");
      await dbRef.current.waitReady;
      setReady(true);
      setLog("PGlite ready — Postgres 15 in browser (IndexedDB persistence)");
    })().catch((e) => setLog("Init failed: " + e.message));
    return () => { dbRef.current?.close?.(); };
  }, []);

  async function run() {
    if (!dbRef.current) return;
    setBusy(true); setLog("Running…"); setRows(null);
    const t0 = performance.now();
    try {
      const res = await dbRef.current.exec(sql);
      const last = Array.isArray(res) ? res[res.length - 1] : res;
      if (last?.rows) {
        setRows(last.rows);
        setCols(last.fields?.map((f: any) => f.name) || Object.keys(last.rows[0] || {}));
      } else {
        setRows([]); setCols([]);
      }
      setLog(`OK · ${(performance.now() - t0).toFixed(1)} ms · ${last?.rows?.length ?? 0} rows`);
    } catch (e: any) {
      setLog("Error: " + e.message);
    } finally { setBusy(false); }
  }

  async function reset() {
    if (!confirm("Drop all data and reset the database?")) return;
    await dbRef.current?.close?.();
    await indexedDB.deleteDatabase("/pglite/webos-pglite");
    location.reload();
  }

  function exportCsv() {
    if (!rows?.length) return;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    downloadText(csv, "query.csv", "text/csv");
  }
  function exportJson() { if (rows) downloadText(JSON.stringify(rows, null, 2), "query.json", "application/json"); }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b px-3 py-2 flex items-center gap-2 flex-wrap">
        <Database size={16} className="text-primary"/>
        <span className="font-medium text-sm">PGlite</span>
        <span className="text-xs text-muted-foreground">Postgres in WASM</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={run} disabled={!ready || busy}>
            {busy ? <Loader2 size={14} className="mr-1 animate-spin"/> : <Play size={14} className="mr-1"/>}Run
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows?.length}><Download size={14} className="mr-1"/>CSV</Button>
          <Button size="sm" variant="outline" onClick={exportJson} disabled={!rows?.length}>JSON</Button>
          <Button size="sm" variant="ghost" onClick={reset} disabled={!ready}><Trash2 size={14}/></Button>
        </div>
      </div>
      <textarea value={sql} onChange={(e) => setSql(e.target.value)} spellCheck={false}
        className="w-full h-1/2 p-3 mono text-xs bg-card border-b outline-none resize-none"/>
      <div className="px-3 py-1 text-xs mono border-b bg-muted/40">{log}</div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        {rows && rows.length > 0 ? (
          <table className="w-full text-xs">
            <thead className="bg-muted/60 sticky top-0">
              <tr>{cols.map((c) => <th key={c} className="p-2 text-left font-medium border-b">{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b hover:bg-accent/30">
                  {cols.map((c) => <td key={c} className="p-2 mono">{String(r[c] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : rows ? <div className="p-4 text-xs text-muted-foreground">Query OK · no rows returned.</div>
          : <div className="p-4 text-xs text-muted-foreground">Press Run to execute.</div>}
      </div>
    </div>
  );
}
