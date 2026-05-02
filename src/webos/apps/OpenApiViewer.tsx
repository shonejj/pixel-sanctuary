import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SAMPLE = `openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      tags: [Users]
      responses:
        '200': { description: OK }
    post:
      summary: Create user
      tags: [Users]
      responses:
        '201': { description: Created }
  /users/{id}:
    get:
      summary: Get a user
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
      responses:
        '200': { description: OK }
        '404': { description: Not found }`;

export function OpenApiViewer() {
  const [text, setText] = useState(SAMPLE);
  const spec = useMemo(() => parse(text), [text]);

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} className="mono text-xs min-h-[400px]" />
        <div className="bg-card border rounded-xl p-3 overflow-auto">
          {!spec ? (
            <div className="text-sm text-destructive">Invalid spec</div>
          ) : (
            <div>
              <h2 className="text-lg font-bold">{spec.info?.title || "API"}</h2>
              <div className="text-xs text-muted-foreground mb-3">v{spec.info?.version || "?"}</div>
              {Object.entries(spec.paths || {}).map(([path, methods]: any) => (
                <div key={path} className="mb-3 border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted px-3 py-1 mono text-sm">{path}</div>
                  <div>
                    {Object.entries(methods).map(([method, op]: any) => (
                      <details key={method} className="border-t border-border">
                        <summary className="px-3 py-2 cursor-pointer flex items-center gap-2 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${methodColor(method)}`}>{method}</span>
                          <span>{op.summary || ""}</span>
                        </summary>
                        <div className="px-3 py-2 text-xs space-y-1">
                          {op.parameters && (
                            <div><b>Parameters:</b> {op.parameters.map((p: any) => p.name).join(", ")}</div>
                          )}
                          {op.responses && (
                            <div><b>Responses:</b> {Object.keys(op.responses).join(", ")}</div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function methodColor(m: string) {
  return { get: "bg-blue-500 text-white", post: "bg-emerald-500 text-white", put: "bg-yellow-500 text-white", delete: "bg-destructive text-white", patch: "bg-purple-500 text-white" }[m] || "bg-muted";
}

function parse(text: string): any {
  const t = text.trim();
  if (t.startsWith("{")) {
    try { return JSON.parse(t); } catch { return null; }
  }
  // very light YAML parser, just enough for typical OpenAPI specs
  return parseYaml(text);
}

function parseYaml(text: string): any {
  const lines = text.split("\n").filter((l) => !l.match(/^\s*#/) && l.trim());
  const root: any = {};
  const stack: { obj: any; indent: number }[] = [{ obj: root, indent: -1 }];
  for (const line of lines) {
    const indent = line.match(/^\s*/)![0].length;
    const trimmed = line.trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    let m;
    if ((m = trimmed.match(/^-\s*(.+)$/))) {
      if (!Array.isArray(parent.__list)) parent.__list = [];
      const item = inlineParse(m[1]);
      parent.__list.push(item);
    } else if ((m = trimmed.match(/^(['"]?)([\w.-]+)\1\s*:\s*(.*)$/))) {
      const key = m[2];
      const val = m[3];
      if (!val) {
        const child: any = {};
        parent[key] = child;
        stack.push({ obj: child, indent });
      } else {
        parent[key] = inlineParse(val);
      }
    }
  }
  // unwrap __list arrays
  function clean(o: any): any {
    if (o && typeof o === "object") {
      if (o.__list) return o.__list.map(clean);
      const out: any = {};
      for (const k of Object.keys(o)) out[k] = clean(o[k]);
      return out;
    }
    return o;
  }
  return clean(root);
}

function inlineParse(s: string): any {
  s = s.trim();
  if (!s) return "";
  if (s.startsWith("[") && s.endsWith("]")) return s.slice(1, -1).split(",").map((x) => inlineParse(x));
  if (s.startsWith("{") && s.endsWith("}")) {
    const out: any = {};
    s.slice(1, -1).split(",").forEach((kv) => {
      const [k, v] = kv.split(":");
      if (k) out[k.trim().replace(/['"]/g, "")] = inlineParse(v || "");
    });
    return out;
  }
  if (/^-?\d+$/.test(s)) return +s;
  if (s === "true") return true;
  if (s === "false") return false;
  return s.replace(/^['"]|['"]$/g, "");
}
