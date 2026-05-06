import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Weather() {
  const [loc, setLoc] = useState(""); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchWeather(lat: number, lon: number, name?: string) {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
      const j = await r.json(); setData({ ...j, name });
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }
  async function search() {
    if (!loc) return;
    setLoading(true); setErr("");
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc)}&count=1`);
      const j = await r.json();
      if (!j.results?.[0]) { setErr("Location not found"); setLoading(false); return; }
      const p = j.results[0]; await fetchWeather(p.latitude, p.longitude, `${p.name}, ${p.country}`);
    } catch (e: any) { setErr(e.message); setLoading(false); }
  }

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => fetchWeather(p.coords.latitude, p.coords.longitude, "Your location"),
      () => fetchWeather(40.7128, -74.006, "New York")
    );
  }, []);

  const wmo: Record<number, string> = { 0: "☀️ Clear", 1: "🌤 Mostly clear", 2: "⛅ Partly cloudy", 3: "☁️ Overcast", 45: "🌫 Fog", 48: "🌫 Fog", 51: "🌦 Drizzle", 61: "🌧 Rain", 71: "❄️ Snow", 80: "🌧 Showers", 95: "⛈ Thunderstorm" };
  const cur = data?.current; const dy = data?.daily;

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="flex gap-2">
        <input value={loc} onChange={e => setLoc(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="City name…" className="flex-1 bg-card border rounded px-3 py-2 text-sm outline-none" />
        <Button onClick={search} disabled={loading}>Search</Button>
      </div>
      {err && <div className="text-destructive text-sm">{err}</div>}
      {cur && (
        <div className="space-y-3">
          <div className="border rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-card">
            <div className="text-sm text-muted-foreground">{data.name}</div>
            <div className="text-5xl font-bold mt-1">{Math.round(cur.temperature_2m)}°C</div>
            <div className="text-lg mt-2">{wmo[cur.weather_code] || "—"}</div>
            <div className="text-xs text-muted-foreground mt-2">💨 {cur.wind_speed_10m} km/h · 💧 {cur.relative_humidity_2m}%</div>
          </div>
          {dy && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {dy.time.slice(0, 7).map((t: string, i: number) => (
                <div key={t} className="border rounded-xl p-3 text-center text-xs">
                  <div className="font-medium">{new Date(t).toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="text-2xl my-1">{(wmo[dy.weather_code[i]] || "").split(" ")[0]}</div>
                  <div><b>{Math.round(dy.temperature_2m_max[i])}°</b> / {Math.round(dy.temperature_2m_min[i])}°</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!cur && loading && <div className="text-sm text-muted-foreground">Loading…</div>}
    </div>
  );
}
