import type { AppDef } from "./kernel";
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
import {
  DollarSign, Skull, Scale, Search, MessageSquareText, ImageOff, Brain, Globe,
  Palette, Gavel, Regex, Lock, KeyRound, Clock, Camera, Shield, Table, FileJson,
  GitCompare, Eye, StickyNote, FolderOpen,
} from "lucide-react";

const I = (Icon: any) => <Icon size={22} />;

export const ALL_APPS: AppDef[] = [
  { id: "meeting-cost", name: "Meeting Cost", icon: I(DollarSign), category: "lifestyle", Component: MeetingCostCalculator, accent: "linear-gradient(135deg,#6366f1,#a855f7)" },
  { id: "subs", name: "Subscriptions", icon: I(Skull), category: "lifestyle", Component: SubscriptionGraveyard, accent: "linear-gradient(135deg,#0f172a,#475569)" },
  { id: "rent-split", name: "Rent Split", icon: I(Scale), category: "lifestyle", Component: RentSplit, accent: "linear-gradient(135deg,#10b981,#0891b2)" },
  { id: "review-auth", name: "Review Analyzer", icon: I(Search), category: "lifestyle", Component: ReviewAuthenticity, accent: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { id: "thread-sum", name: "Thread Summarizer", icon: I(MessageSquareText), category: "productivity", Component: ThreadSummarizer, accent: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
  { id: "scrubber", name: "Metadata Scrubber", icon: I(ImageOff), category: "productivity", Component: MetadataScrubber, accent: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { id: "brain-dump", name: "Brain Dump", icon: I(Brain), category: "productivity", Component: BrainDump, accent: "linear-gradient(135deg,#ec4899,#f59e0b)" },
  { id: "timezone", name: "Timezone Planner", icon: I(Globe), category: "productivity", Component: TimezonePlanner, accent: "linear-gradient(135deg,#14b8a6,#3b82f6)" },
  { id: "palette", name: "Palette Builder", icon: I(Palette), category: "design", Component: PaletteBuilder, accent: "linear-gradient(135deg,#f43f5e,#fb923c)" },
  { id: "legal", name: "Legal Decoder", icon: I(Gavel), category: "lifestyle", Component: LegalDecoder, accent: "linear-gradient(135deg,#7c3aed,#1e40af)" },
  { id: "regex", name: "Regex", icon: I(Regex), category: "developer", Component: RegexVisualizer, accent: "linear-gradient(135deg,#059669,#1e293b)" },
  { id: "ssl", name: "SSL Decoder", icon: I(Lock), category: "developer", Component: SslDecoder, accent: "linear-gradient(135deg,#1e293b,#475569)" },
  { id: "jwt", name: "JWT Inspector", icon: I(KeyRound), category: "developer", Component: JwtInspector, accent: "linear-gradient(135deg,#dc2626,#7c3aed)" },
  { id: "cron", name: "Cron Builder", icon: I(Clock), category: "developer", Component: CronBuilder, accent: "linear-gradient(135deg,#0891b2,#1e40af)" },
  { id: "screenshot", name: "Code Screenshot", icon: I(Camera), category: "developer", Component: CodeScreenshot, accent: "linear-gradient(135deg,#1e3a8a,#9333ea)" },
  { id: "pii", name: "PII Sanitizer", icon: I(Shield), category: "developer", Component: PiiSanitizer, accent: "linear-gradient(135deg,#16a34a,#0f766e)" },
  { id: "md-table", name: "Markdown Table", icon: I(Table), category: "developer", Component: MarkdownTable, accent: "linear-gradient(135deg,#475569,#1e293b)" },
  { id: "openapi", name: "OpenAPI Viewer", icon: I(FileJson), category: "developer", Component: OpenApiViewer, accent: "linear-gradient(135deg,#65a30d,#0e7490)" },
  { id: "diff", name: "Diff Checker", icon: I(GitCompare), category: "developer", Component: DiffChecker, accent: "linear-gradient(135deg,#be185d,#7c3aed)" },
  { id: "cvd", name: "Color Vision Sim", icon: I(Eye), category: "design", Component: ColorVisionSim, accent: "linear-gradient(135deg,#f59e0b,#10b981)" },
  { id: "notes", name: "Notes", icon: I(StickyNote), category: "system", Component: NotesApp, accent: "linear-gradient(135deg,#facc15,#f97316)", singleton: true },
  { id: "files", name: "Files", icon: I(FolderOpen), category: "system", Component: FileExplorer, accent: "linear-gradient(135deg,#3b82f6,#06b6d4)", singleton: true },
];
