import type { AppDef } from "./kernel";
import { useWebOS } from "./kernel";
import { useEffect } from "react";
import { MeetingCostCalculator } from "./apps/MeetingCost";
import { SubscriptionGraveyard } from "./apps/SubscriptionGraveyard";
import { RentSplit } from "./apps/RentSplit";
import { ReviewAuthenticity } from "./apps/ReviewAuthenticity";
import { ThreadSummarizer } from "./apps/ThreadSummarizer";
import { MetadataScrubber } from "./apps/MetadataScrubber";
import { BrainDump } from "./apps/BrainDump";
import { TimezonePlanner } from "./apps/TimezonePlanner";
import { PaletteBuilder } from "./apps/PaletteBuilder";
import { LegalDecoder } from "./apps/LegalDecoder";
import { RegexVisualizer } from "./apps/RegexVisualizer";
import { SslDecoder } from "./apps/SslDecoder";
import { JwtInspector } from "./apps/JwtInspector";
import { CronBuilder } from "./apps/CronBuilder";
import { CodeScreenshot } from "./apps/CodeScreenshot";
import { PiiSanitizer } from "./apps/PiiSanitizer";
import { MarkdownTable } from "./apps/MarkdownTable";
import { OpenApiViewer } from "./apps/OpenApiViewer";
import { DiffChecker } from "./apps/DiffChecker";
import { ColorVisionSim } from "./apps/ColorVisionSim";
import { NotesApp } from "./apps/NotesApp";
import { FileExplorer } from "./apps/FileExplorer";
import { Calculator } from "./apps/Calculator";
import { TodoApp } from "./apps/TodoApp";
import { Pomodoro } from "./apps/Pomodoro";
import { Stopwatch } from "./apps/Stopwatch";
import { QrGenerator } from "./apps/QrGenerator";
import { PasswordGen } from "./apps/PasswordGen";
import { UnitConverter } from "./apps/UnitConverter";
import { MarkdownEditor } from "./apps/MarkdownEditor";
import { PaintApp } from "./apps/PaintApp";
import { CalendarApp } from "./apps/CalendarApp";
import { JsonFormatter } from "./apps/JsonFormatter";
import { CodeEditor } from "./apps/CodeEditor";
import { DuckDbApp } from "./apps/DuckDbApp";
import { ClockApp } from "./apps/ClockApp";
import {
  DollarSign, Skull, Scale, Search, MessageSquareText, ImageOff, Brain, Globe,
  Palette, Gavel, Regex, Lock, KeyRound, Clock, Camera, Shield, Table, FileJson,
  GitCompare, Eye, StickyNote, FolderOpen, Calculator as CalcIcon, ListTodo,
  Timer, TimerReset, QrCode, KeySquare, ArrowRightLeft, FileText, Brush,
  CalendarDays, Code2, Database,
} from "lucide-react";

const I = (Icon: any, color = "#fff") => <Icon size={22} color={color} />;

export const ALL_APPS: AppDef[] = [
  // SYSTEM
  { id: "files", name: "Files", icon: I(FolderOpen), category: "system", Component: FileExplorer, accent: "linear-gradient(135deg,#3b82f6,#06b6d4)", singleton: true, tags: ["folder","file","browser"] },
  { id: "notes", name: "Notes", icon: I(StickyNote), category: "system", Component: NotesApp, accent: "linear-gradient(135deg,#facc15,#f97316)", singleton: true, tags: ["write","markdown"] },
  { id: "calc", name: "Calculator", icon: I(CalcIcon), category: "system", Component: Calculator, accent: "linear-gradient(135deg,#1e293b,#475569)", defaultWidth: 360, defaultHeight: 520 },
  { id: "clock", name: "Clock", icon: I(Clock), category: "system", Component: ClockApp, accent: "linear-gradient(135deg,#0ea5e9,#1e40af)" },
  { id: "calendar", name: "Calendar", icon: I(CalendarDays), category: "system", Component: CalendarApp, accent: "linear-gradient(135deg,#ef4444,#f97316)" },

  // PRODUCTIVITY (non-tech)
  { id: "todo", name: "Tasks", icon: I(ListTodo), category: "productivity", Component: TodoApp, accent: "linear-gradient(135deg,#10b981,#059669)" },
  { id: "pomodoro", name: "Pomodoro", icon: I(Timer), category: "productivity", Component: Pomodoro, accent: "linear-gradient(135deg,#dc2626,#ec4899)" },
  { id: "stopwatch", name: "Stopwatch", icon: I(TimerReset), category: "productivity", Component: Stopwatch, accent: "linear-gradient(135deg,#7c3aed,#3b82f6)" },
  { id: "thread-sum", name: "Thread Summarizer", icon: I(MessageSquareText), category: "productivity", Component: ThreadSummarizer, accent: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "brain-dump", name: "Brain Dump", icon: I(Brain), category: "productivity", Component: BrainDump, accent: "linear-gradient(135deg,#ec4899,#f59e0b)" },
  { id: "timezone", name: "Timezone Planner", icon: I(Globe), category: "productivity", Component: TimezonePlanner, accent: "linear-gradient(135deg,#14b8a6,#3b82f6)" },
  { id: "scrubber", name: "Metadata Scrubber", icon: I(ImageOff), category: "productivity", Component: MetadataScrubber, accent: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { id: "unit", name: "Unit Converter", icon: I(ArrowRightLeft), category: "productivity", Component: UnitConverter, accent: "linear-gradient(135deg,#0891b2,#10b981)" },

  // LIFESTYLE (non-tech)
  { id: "meeting-cost", name: "Meeting Cost", icon: I(DollarSign), category: "lifestyle", Component: MeetingCostCalculator, accent: "linear-gradient(135deg,#6366f1,#a855f7)" },
  { id: "subs", name: "Subscriptions", icon: I(Skull), category: "lifestyle", Component: SubscriptionGraveyard, accent: "linear-gradient(135deg,#0f172a,#475569)" },
  { id: "rent-split", name: "Rent Split", icon: I(Scale), category: "lifestyle", Component: RentSplit, accent: "linear-gradient(135deg,#10b981,#0891b2)" },
  { id: "review-auth", name: "Review Analyzer", icon: I(Search), category: "lifestyle", Component: ReviewAuthenticity, accent: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { id: "legal", name: "Legal Decoder", icon: I(Gavel), category: "lifestyle", Component: LegalDecoder, accent: "linear-gradient(135deg,#7c3aed,#1e40af)" },

  // CREATIVE
  { id: "paint", name: "Paint", icon: I(Brush), category: "creative", Component: PaintApp, accent: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
  { id: "palette", name: "Palette Builder", icon: I(Palette), category: "creative", Component: PaletteBuilder, accent: "linear-gradient(135deg,#f43f5e,#fb923c)" },
  { id: "cvd", name: "Color Vision Sim", icon: I(Eye), category: "creative", Component: ColorVisionSim, accent: "linear-gradient(135deg,#f59e0b,#10b981)" },
  { id: "md-edit", name: "Markdown", icon: I(FileText), category: "creative", Component: MarkdownEditor, accent: "linear-gradient(135deg,#0f172a,#334155)" },
  { id: "qr", name: "QR Code", icon: I(QrCode), category: "creative", Component: QrGenerator, accent: "linear-gradient(135deg,#0f172a,#0891b2)" },

  // TECH / DEV
  { id: "code", name: "Code Editor", icon: I(Code2), category: "tech", Component: CodeEditor, accent: "linear-gradient(135deg,#1e3a8a,#7c3aed)", defaultWidth: 1100, defaultHeight: 700 },
  { id: "duckdb", name: "DuckDB SQL", icon: I(Database), category: "tech", Component: DuckDbApp, accent: "linear-gradient(135deg,#fbbf24,#1e293b)", defaultWidth: 1000 },
  { id: "json", name: "JSON Tools", icon: I(FileJson), category: "tech", Component: JsonFormatter, accent: "linear-gradient(135deg,#65a30d,#0e7490)" },
  { id: "regex", name: "Regex", icon: I(Regex), category: "tech", Component: RegexVisualizer, accent: "linear-gradient(135deg,#059669,#1e293b)" },
  { id: "ssl", name: "SSL Decoder", icon: I(Lock), category: "tech", Component: SslDecoder, accent: "linear-gradient(135deg,#1e293b,#475569)" },
  { id: "jwt", name: "JWT Inspector", icon: I(KeyRound), category: "tech", Component: JwtInspector, accent: "linear-gradient(135deg,#dc2626,#7c3aed)" },
  { id: "cron", name: "Cron Builder", icon: I(Clock), category: "tech", Component: CronBuilder, accent: "linear-gradient(135deg,#0891b2,#1e40af)" },
  { id: "screenshot", name: "Code Screenshot", icon: I(Camera), category: "tech", Component: CodeScreenshot, accent: "linear-gradient(135deg,#1e3a8a,#9333ea)" },
  { id: "pii", name: "PII Sanitizer", icon: I(Shield), category: "tech", Component: PiiSanitizer, accent: "linear-gradient(135deg,#16a34a,#0f766e)" },
  { id: "md-table", name: "Markdown Table", icon: I(Table), category: "tech", Component: MarkdownTable, accent: "linear-gradient(135deg,#475569,#1e293b)" },
  { id: "openapi", name: "OpenAPI Viewer", icon: I(FileJson), category: "tech", Component: OpenApiViewer, accent: "linear-gradient(135deg,#65a30d,#0e7490)" },
  { id: "diff", name: "Diff Checker", icon: I(GitCompare), category: "tech", Component: DiffChecker, accent: "linear-gradient(135deg,#be185d,#7c3aed)" },
  { id: "pwd", name: "Password Generator", icon: I(KeySquare), category: "tech", Component: PasswordGen, accent: "linear-gradient(135deg,#16a34a,#15803d)" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  system: "System",
  productivity: "Productivity",
  lifestyle: "Lifestyle",
  creative: "Creative",
  tech: "Developer & Tech",
};

// Custom-app sandbox component (HTML or URL iframe)
export function CustomAppRenderer({ params }: { windowId: string; params?: { mode: "html" | "url"; source: string } }) {
  if (!params) return <div className="p-4">No source</div>;
  if (params.mode === "url") {
    return <iframe src={params.source} className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" />;
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui;margin:12px;color:#111;background:#fff}</style></head><body>${params.source}</body></html>`;
  return <iframe srcDoc={html} className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-forms allow-modals" />;
}

export function useRegisterAllApps() {
  const customApps = useWebOS(s => s.customApps);
  useEffect(() => {
    // built-ins
    import("./kernel").then(({ registerApp }) => {
      ALL_APPS.forEach(registerApp);
      // custom apps
      customApps.forEach((meta: any) => {
        registerApp({
          ...meta,
          icon: <span style={{ fontSize: 18 }}>🧩</span>,
          Component: (p: any) => <CustomAppRenderer windowId={p.windowId} params={{ mode: meta.customMode, source: meta.customSource }} />,
        });
      });
    });
  }, [customApps]);
}
