import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { pushClipboard } from "../kernel";

type Align = "left" | "center" | "right";

export function MarkdownTable() {
  const [headers, setHeaders] = useState(["Name", "Role", "Score"]);
  const [aligns, setAligns] = useState<Align[]>(["left", "left", "right"]);
  const [rows, setRows] = useState([
    ["Alex", "Engineer", "92"],
    ["Jordan", "Designer", "88"],
  ]);

  const md = useMemo(() => toMarkdown(headers, aligns, rows), [headers, aligns, rows]);

  function setCell(r: number, c: number, v: string) {
    setRows(rows.map((row, i) => (i === r ? row.map((cv, j) => (j === c ? v : cv)) : row)));
  }
  function addRow() { setRows([...rows, headers.map(() => "")]); }
  function addCol() {
    setHeaders([...headers, `Col ${headers.length + 1}`]);
    setAligns([...aligns, "left"]);
    setRows(rows.map((r) => [...r, ""]));
  }
  function delRow(i: number) { setRows(rows.filter((_, j) => j !== i)); }
  function delCol(i: number) {
    setHeaders(headers.filter((_, j) => j !== i));
    setAligns(aligns.filter((_, j) => j !== i));
    setRows(rows.map((r) => r.filter((_, j) => j !== i)));
  }

  return (
    <AppShell>
      <div className="p-6 space-y-3">
        <div className="overflow-auto bg-card border rounded-xl p-3">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="border border-border p-1">
                    <div className="flex items-center gap-1">
                      <input
                        className="bg-transparent w-full px-1 font-semibold"
                        value={h}
                        onChange={(e) => setHeaders(headers.map((x, j) => (j === i ? e.target.value : x)))}
                      />
                      <select
                        value={aligns[i]}
                        onChange={(e) => setAligns(aligns.map((x, j) => (j === i ? e.target.value as Align : x)))}
                        className="text-xs bg-background border rounded"
                      >
                        <option>left</option><option>center</option><option>right</option>
                      </select>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => delCol(i)}><Trash2 size={12} /></Button>
                    </div>
                  </th>
                ))}
                <th className="p-1"><Button size="icon" variant="ghost" onClick={addCol}><Plus size={14} /></Button></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border p-1">
                      <input className="w-full bg-transparent px-1" value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} />
                    </td>
                  ))}
                  <td className="p-1"><Button size="icon" variant="ghost" onClick={() => delRow(ri)}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button variant="outline" size="sm" className="mt-2" onClick={addRow}><Plus size={14} className="mr-1" /> Row</Button>
        </div>

        <div className="bg-card border rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Markdown</div>
            <Button size="sm" variant="outline" onClick={() => pushClipboard(md)}>Copy</Button>
          </div>
          <pre className="mono text-xs whitespace-pre-wrap mt-2">{md}</pre>
        </div>
      </div>
    </AppShell>
  );
}

function toMarkdown(headers: string[], aligns: Align[], rows: string[][]) {
  const sep = aligns.map((a) => (a === "center" ? ":---:" : a === "right" ? "---:" : ":---")).join(" | ");
  const lines = ["| " + headers.join(" | ") + " |", "| " + sep + " |"];
  rows.forEach((r) => lines.push("| " + r.join(" | ") + " |"));
  return lines.join("\n");
}
