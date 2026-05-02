import { useMemo, useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JwtInspector() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQwOTE2NjI0MjJ9.4AT8aF5zAQqCZi9pTSIRRQYYBPPK2bx5lTmuUlQRiFs",
  );
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const parsed = useMemo(() => {
    try {
      const [h, p, s] = token.split(".");
      return { header: JSON.parse(b64url(h)), payload: JSON.parse(b64url(p)), signature: s, ok: true };
    } catch {
      return { ok: false } as any;
    }
  }, [token]);

  async function verify() {
    if (!parsed.ok) return;
    if (parsed.header.alg !== "HS256") {
      setVerifyResult("Only HS256 verification supported here.");
      return;
    }
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const data = token.split(".").slice(0, 2).join(".");
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
      const expected = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      setVerifyResult(expected === parsed.signature ? "✓ Signature valid" : "✗ Signature invalid");
    } catch (e: any) {
      setVerifyResult("Error: " + e.message);
    }
  }

  return (
    <AppShell>
      <div className="p-6 space-y-3">
        <Textarea value={token} onChange={(e) => setToken(e.target.value)} className="mono text-xs min-h-[80px]" />
        {!parsed.ok ? (
          <div className="text-sm text-destructive">Invalid JWT</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            <Box title="Header" json={parsed.header} color="oklch(0.65 0.22 25 / 0.15)" />
            <Box title="Payload" json={parsed.payload} color="oklch(0.62 0.16 230 / 0.15)" />
            <div className="bg-card border rounded-xl p-3 md:col-span-2">
              <div className="text-sm font-semibold mb-2">Time claims</div>
              <ul className="text-sm space-y-1">
                {["iat", "nbf", "exp"].map((k) => parsed.payload[k] ? (
                  <li key={k}>
                    <b>{k}</b>: {new Date(parsed.payload[k] * 1000).toLocaleString()} {k === "exp" && (parsed.payload[k] * 1000 < Date.now() ? <span className="text-destructive">expired</span> : <span className="text-emerald-500">valid</span>)}
                  </li>
                ) : null)}
              </ul>
            </div>
            <div className="bg-card border rounded-xl p-3 md:col-span-2 space-y-2">
              <div className="text-sm font-semibold">Verify HS256 signature</div>
              <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret" className="mono" />
              <Button onClick={verify}>Verify</Button>
              {verifyResult && <div className="text-sm">{verifyResult}</div>}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Box({ title, json, color }: { title: string; json: any; color: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ background: color }}>
      <div className="text-sm font-semibold mb-2">{title}</div>
      <pre className="mono text-xs whitespace-pre-wrap">{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
}

function b64url(s: string) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}
