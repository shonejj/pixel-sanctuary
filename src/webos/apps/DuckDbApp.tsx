import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Upload, Database, Download } from "lucide-react";

export function DuckDbApp() {
  const [status, setStatus] = useState("Initializing DuckDB WASM…");
  const [ready, setReady] = useState(false);
  const [sql, setSql] = useState("SELECT 42 AS answer, 'hello duckdb' AS msg;");
  const [results, setResults] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [error, setError] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const dbRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const duckdb: any = await import("@duckdb/duckdb-wasm");
        const bundles = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(bundles);
        const workerUrl = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" }));
        const worker = new Worker(workerUrl);
        const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);
        const conn = await db.connect();
        if (cancelled) return;
        dbRef.current = db; connRef.current = conn;
        setStatus("Ready"); setReady(true);
      } catch (e: any) { setStatus("Failed: " + e.message); }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refreshTables() {
    try {
      const r = await connRef.current.query("SELECT table_name FROM information_schema.tables WHERE table_schema='main';");
      setTables(r.toArray().map((x: any) => x.table_name));
    } catch {}
  }

  async function run() {
    if (!ready) return;
    setError("");
    try {
      const r = await connRef.current.query(sql);
      const rows = r.toArray().map((x: any) => Object.fromEntries(Object.entries(x).map(([k,v]: any) => [k, typeof v === "bigint" ? v.toString() : v])));
      if (rows.length) setResults({ headers: Object.keys(rows[0]), rows: rows.map((r: any) => Object.values(r)) });
      else setResults({ headers: [], rows: [] });
      refreshTables();
    } catch (e: any) { setError(e.message); setResults(null); }
  }

  async function loadFile(e: any) {
    const file = e.target.files[0]; if (!file) return;
    const buf = new Uint8Array(await file.arrayBuffer());
    await dbRef.current.registerFileBuffer(file.name, buf);
    const tname = file.name.replace(/\W+/g, "_");
    const reader = file.name.endsWith(".json") ? "read_json_auto" : file.name.endsWith(".parquet") ? "read_parquet" : "read_csv_auto";
    await connRef.current.query(`CREATE OR REPLACE TABLE ${tname} AS SELECT * FROM ${reader}('${file.name}')`);
    setFiles(f => [...f, file.name]);
    setSql(`SELECT * FROM ${tname} LIMIT 50;`);
    refreshTables();
  }

  return (
    <div className="flex h-full bg-background">
      <div className="w-56 border-r bg-card flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 text-xs"><Database size={14}/><span className={ready ? "text-green-500" : "text-amber-500"}>{status}</span></div>
        </div>
        <div className="p-2">
          <label className="block">
            <input type="file" className="hidden" accept=".csv,.json,.parquet" onChange={loadFile} />
            <span className="cursor-pointer flex items-center gap-2 text-sm p-2 rounded hover:bg-accent"><Upload size={14}/>Import file</span>
          </label>
        </div>
        <div className="px-3 py-1 text-xs text-muted-foreground uppercase">Tables</div>
        <div className="flex-1 overflow-auto px-2 text-sm space-y-0.5">
          {tables.map(t => <button key={t} onClick={() => setSql(`SELECT * FROM ${t} LIMIT 100;`)} className="w-full text-left p-1.5 rounded hover:bg-accent">📊 {t}</button>)}
          {!tables.length && <div className="px-2 text-xs text-muted-foreground">None</div>}
        </div>
        <div className="px-3 py-1 text-xs text-muted-foreground uppercase border-t">Files</div>
        <div className="px-2 py-1 text-xs">{files.map(f => <div key={f}>📄 {f}</div>)}</div>
      </div>
      <div className="flex-1 flex flex-col">
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} className="p-3 mono text-sm bg-card border-b min-h-32 outline-none resize-none" spellCheck={false} />
        <div className="border-b p-2"><Button size="sm" onClick={run} disabled={!ready}><Play size={12} className="mr-1"/>Run query</Button></div>
        <div className="flex-1 overflow-auto p-2">
          {error && <div className="text-destructive mono text-sm p-3 bg-destructive/10 rounded">{error}</div>}
          {results && (
            <table className="w-full text-xs mono">
              <thead><tr className="bg-muted">{results.headers.map(h => <th key={h} className="text-left p-2 border">{h}</th>)}</tr></thead>
              <tbody>{results.rows.map((r,i) => <tr key={i} className="hover:bg-accent">{r.map((c,j) => <td key={j} className="p-2 border">{String(c)}</td>)}</tr>)}</tbody>
            </table>
          )}
          {results && !results.rows.length && <div className="text-muted-foreground p-3 text-sm">Query OK · 0 rows</div>}
        </div>
      </div>
    </div>
  );
}
