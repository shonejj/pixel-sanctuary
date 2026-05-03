import { useEffect, useState } from "react";

export function ClockApp() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  if (!now) return null;
  const zones = [
    { name: "Local", tz: undefined },
    { name: "New York", tz: "America/New_York" },
    { name: "London", tz: "Europe/London" },
    { name: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Sydney", tz: "Australia/Sydney" },
  ];
  return (
    <div className="p-6 h-full overflow-auto bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="text-center mb-8">
        <div className="text-7xl font-bold mono tabular-nums" suppressHydrationWarning>{now.toLocaleTimeString()}</div>
        <div className="text-muted-foreground mt-2" suppressHydrationWarning>{now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {zones.map(z => (
          <div key={z.name} className="bg-card border rounded-xl p-4">
            <div className="text-xs text-muted-foreground uppercase">{z.name}</div>
            <div className="text-2xl mono mt-1" suppressHydrationWarning>{now.toLocaleTimeString([], { timeZone: z.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
