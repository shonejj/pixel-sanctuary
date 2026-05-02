import { useState } from "react";
import { AppShell } from "../AppShell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function SslDecoder() {
  const [pem, setPem] = useState("");
  const [decoded, setDecoded] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function decode() {
    setErr(null);
    try {
      const m = pem.match(/-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/);
      if (!m) throw new Error("No PEM certificate block found");
      const b64 = m[1].replace(/\s/g, "");
      const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const result = parseCert(der);
      // also fingerprints
      const sha256 = await fp(der, "SHA-256");
      const sha1 = await fp(der, "SHA-1");
      setDecoded({ ...result, fingerprints: { sha1, sha256 } });
    } catch (e: any) {
      setErr(e.message);
      setDecoded(null);
    }
  }

  return (
    <AppShell>
      <div className="p-6 grid md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2">
          <Textarea value={pem} onChange={(e) => setPem(e.target.value)} placeholder="-----BEGIN CERTIFICATE-----..." className="flex-1 min-h-[300px] mono text-xs" />
          <Button onClick={decode}>Decode</Button>
          {err && <div className="text-xs text-destructive">{err}</div>}
        </div>
        <div className="bg-card border rounded-xl p-3 overflow-auto">
          {!decoded ? (
            <div className="text-sm text-muted-foreground">Paste a PEM certificate to inspect.</div>
          ) : (
            <div className="text-sm space-y-2">
              <Row k="Subject" v={decoded.subject} />
              <Row k="Issuer" v={decoded.issuer} />
              <Row k="Serial" v={decoded.serial} />
              <Row k="Valid from" v={decoded.notBefore} />
              <Row k="Valid until" v={decoded.notAfter} />
              <ValidityBar notBefore={decoded.notBefore} notAfter={decoded.notAfter} />
              <Row k="SHA-256" v={decoded.fingerprints.sha256} mono />
              <Row k="SHA-1" v={decoded.fingerprints.sha1} mono />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="border-b border-border/50 py-1">
      <div className="text-[11px] uppercase text-muted-foreground">{k}</div>
      <div className={mono ? "mono text-xs break-all" : "text-sm break-all"}>{v}</div>
    </div>
  );
}

function ValidityBar({ notBefore, notAfter }: { notBefore: string; notAfter: string }) {
  const start = new Date(notBefore).getTime();
  const end = new Date(notAfter).getTime();
  const now = Date.now();
  const total = end - start;
  const used = now - start;
  const pct = Math.max(0, Math.min(100, (used / total) * 100));
  const remaining = Math.max(0, end - now) / (1000 * 60 * 60 * 24);
  const color = remaining < 1 ? "bg-destructive" : remaining < 30 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div>
      <div className="h-2 bg-muted rounded">
        <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mt-1">{remaining.toFixed(0)} days remaining</div>
    </div>
  );
}

// Minimal ASN.1/X.509 walker — enough for the headline fields.
function parseCert(der: Uint8Array) {
  let p = 0;
  function readLen(): number {
    let l = der[p++];
    if (l & 0x80) {
      const n = l & 0x7f;
      l = 0;
      for (let i = 0; i < n; i++) l = (l << 8) | der[p++];
    }
    return l;
  }
  function readTLV() {
    const tag = der[p++];
    const len = readLen();
    const start = p;
    p += len;
    return { tag, len, start, end: p, bytes: der.slice(start, start + len) };
  }
  function parseSeq(b: Uint8Array): any[] {
    const out: any[] = [];
    let q = 0;
    while (q < b.length) {
      const tag = b[q++];
      let l = b[q++];
      if (l & 0x80) {
        const n = l & 0x7f;
        l = 0;
        for (let i = 0; i < n; i++) l = (l << 8) | b[q++];
      }
      const v = b.slice(q, q + l);
      q += l;
      out.push({ tag, v });
    }
    return out;
  }
  function parseName(seq: Uint8Array): string {
    // SEQUENCE of SET of SEQUENCE { OID, value }
    const parts: string[] = [];
    const rdns = parseSeq(seq);
    rdns.forEach((rdn) => {
      const set = parseSeq(rdn.v);
      set.forEach((s) => {
        const inner = parseSeq(s.v);
        if (inner.length === 2) {
          const oid = oidStr(inner[0].v);
          const val = textOf(inner[1].v);
          const map: Record<string, string> = {
            "2.5.4.3": "CN", "2.5.4.6": "C", "2.5.4.7": "L", "2.5.4.8": "ST",
            "2.5.4.10": "O", "2.5.4.11": "OU",
          };
          parts.push(`${map[oid] || oid}=${val}`);
        }
      });
    });
    return parts.join(", ");
  }
  function oidStr(b: Uint8Array): string {
    const out: number[] = [];
    out.push(Math.floor(b[0] / 40), b[0] % 40);
    let v = 0;
    for (let i = 1; i < b.length; i++) {
      v = (v << 7) | (b[i] & 0x7f);
      if (!(b[i] & 0x80)) {
        out.push(v);
        v = 0;
      }
    }
    return out.join(".");
  }
  function textOf(b: Uint8Array): string {
    return new TextDecoder().decode(b.slice(2)); // skip tag/len of inner string
  }
  function parseTime(b: Uint8Array): string {
    const s = new TextDecoder().decode(b);
    // YYMMDDHHMMSSZ or YYYYMMDDHHMMSSZ
    let y, mo, d, h, mi, se;
    if (s.length === 13) {
      const yy = parseInt(s.slice(0, 2));
      y = yy < 50 ? 2000 + yy : 1900 + yy;
      mo = +s.slice(2, 4); d = +s.slice(4, 6); h = +s.slice(6, 8); mi = +s.slice(8, 10); se = +s.slice(10, 12);
    } else {
      y = +s.slice(0, 4); mo = +s.slice(4, 6); d = +s.slice(6, 8); h = +s.slice(8, 10); mi = +s.slice(10, 12); se = +s.slice(12, 14);
    }
    return new Date(Date.UTC(y, mo - 1, d, h, mi, se)).toISOString();
  }

  // outer SEQ
  readTLV();
  // inner: tbsCertificate SEQ
  const tbs = readTLV.call(null);
  // parse tbs
  const tbsItems = parseSeq(tbs.bytes);
  // tbsItems: [version?, serial, sigAlg, issuer, validity, subject, ...]
  let i = 0;
  let serial: Uint8Array;
  if (tbsItems[0].tag === 0xa0) { i = 1; }
  serial = tbsItems[i++].v;
  i++; // sig alg
  const issuer = parseName(tbsItems[i++].v);
  const validity = parseSeq(tbsItems[i++].v);
  const notBefore = parseTime(validity[0].v);
  const notAfter = parseTime(validity[1].v);
  const subject = parseName(tbsItems[i++].v);
  return {
    subject,
    issuer,
    serial: Array.from(serial).map((x) => x.toString(16).padStart(2, "0")).join(":"),
    notBefore,
    notAfter,
  };
}

async function fp(der: Uint8Array, alg: string) {
  const ab = der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer;
  const buf = await crypto.subtle.digest(alg, ab);
  return Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, "0")).join(":");
}
