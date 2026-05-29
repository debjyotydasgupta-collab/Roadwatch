import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapView, MapMarker } from "@/components/MapView";
import {
  MapPin,
  MessageSquareText,
  ShieldCheck,
  BarChart3,
  MessageCircle,
  ExternalLink,
  Scan,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIVerifiedRepairsViewer } from "@/components/AIVerifiedRepairsViewer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoadWatch — Report road issues & track public spending" },
      {
        name: "description",
        content:
          "Empower citizens to report potholes, waterlogging and road defects, and monitor how public money is spent on repairs.",
      },
      { property: "og:title", content: "RoadWatch — Civic road monitoring" },
      {
        property: "og:description",
        content: "Report road issues. Track spending. Hold authorities accountable.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [stats, setStats] = useState<{ total: number; resolved: number; pending: number } | null>(
    null,
  );

  useEffect(() => {
    mockApi.getAnalytics().then(setStats);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        {stats && (
          <section className="border-b bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-3 gap-4 text-center">
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Active reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
                <ShieldCheck className="h-3 w-3" /> Civic transparency, AI-powered
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                Better roads start with a <span className="text-primary">single tap</span>.
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                RoadWatch lets you report potholes, waterlogging and cracks in seconds — and see
                exactly how your tax money is being spent on repairs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/report">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Report an Issue
                  </Button>
                </Link>
                <Link to="/map">
                  <Button size="lg" variant="outline">
                    View Live Map
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button size="lg" variant="outline">
                    AI Assistant
                  </Button>
                </Link>
                <a href="https://t.me/roadwatch_ai_bot" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-[#229ED9] hover:bg-[#1c88ba] text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Telegram Bot
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <FeatureTile
                  icon={<MapPin />}
                  title="Geo-tagged reports"
                  body="GPS pin + AI image analysis."
                  isInteractive
                  dialogTitle="Live Feed Preview"
                  dialogDesc="Real-time geo-spatial tracking of reported issues."
                  dialogClassName="sm:max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden"
                >
                  <GeoReportsLivePreview />
                </FeatureTile>
                <FeatureTile
                  icon={<MessageSquareText />}
                  title="AI chatbot"
                  body="Ask in plain language, in 3 languages."
                  href="/chat"
                />
                <FeatureTile
                  icon={<BarChart3 />}
                  title="Spending insight"
                  body="See sanctioned vs used budget per road."
                  href="/budget"
                />
                <FeatureTile
                  icon={<ShieldCheck />}
                  title="Verified repairs"
                  body="Before/after photos, AI-confirmed."
                  isInteractive
                  dialogTitle="AI-Verified Road Repairs"
                  dialogDesc="Visual proof of public spending at work."
                  dialogClassName="sm:max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100"
                >
                  <AIVerifiedRepairsViewer showAction={false} />
                </FeatureTile>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}



function FeatureTile({
  icon,
  title,
  body,
  isInteractive,
  children,
  href,
  dialogTitle,
  dialogDesc,
  dialogClassName,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
  href?: string;
  dialogTitle?: string;
  dialogDesc?: string;
  dialogClassName?: string;
}) {
  const content = (
    <div
      className={`rounded-xl border bg-background p-4 h-full text-left transition-all duration-200 ${isInteractive || href ? "hover:border-primary/50 hover:bg-slate-50 hover:scale-[1.02] cursor-pointer" : ""}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full outline-none">
        {content}
      </Link>
    );
  }

  if (isInteractive) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="w-full h-full appearance-none outline-none p-0 bg-transparent text-inherit block">
            {content}
          </button>
        </DialogTrigger>
        <DialogContent className={dialogClassName || "sm:max-w-md"}>
          <DialogHeader className={dialogClassName?.includes("p-0") ? "sr-only" : ""}>
            <DialogTitle>{dialogTitle || "AI Triage Feed"}</DialogTitle>
            <DialogDescription>
              {dialogDesc || "Real-time AI classification feed simulation."}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}

const MOCK_PREVIEW_REPORTS: MapMarker[] = [
  {
    id: "rep-1",
    title: "Deep Pothole",
    address: "Ward 5, MG Road",
    severity: "Critical",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&q=80",
    lat: 23.3321,
    lon: 86.3652,
    status: "Reported"
  },
  {
    id: "rep-2",
    title: "Waterlogging",
    address: "Sector 4, Outer Ring Road",
    severity: "Moderate",
    image_url: "https://images.unsplash.com/photo-1584984277749-923f66c9ffae?w=100&q=80",
    lat: 23.3250,
    lon: 86.3740,
    status: "In Progress"
  },
  {
    id: "rep-3",
    title: "Cracked Surface",
    address: "27th Main, HSR Layout",
    severity: "Minor",
    image_url: "https://images.unsplash.com/photo-1596788068872-2f3b925bdf25?w=100&q=80",
    lat: 23.3121,
    lon: 86.3846,
    status: "Reported"
  },
  {
    id: "rep-4",
    title: "Sinkhole",
    address: "Koramangala 1st Block",
    severity: "Critical",
    image_url: "https://images.unsplash.com/photo-1502877338593-d290670bfb61?w=100&q=80",
    lat: 23.3279,
    lon: 86.3571,
    status: "Reported"
  },
];

function GeoReportsLivePreview() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 overflow-hidden rounded-b-lg">
      <div className="w-full md:w-2/5 border-r bg-white flex flex-col h-[40vh] md:h-full">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 tracking-wider">LIVE FEED</span>
          </div>
          <span className="text-xs text-muted-foreground">{MOCK_PREVIEW_REPORTS.length} issues detected</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {MOCK_PREVIEW_REPORTS.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${hoveredId === item.id ? 'bg-primary/5 border-primary/30 shadow-md scale-[1.02]' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                {item.severity === "Critical" && (
                   <div className="absolute inset-0 border-2 border-red-500 rounded-md animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate text-slate-900">{item.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center mt-1 truncate">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> <span className="truncate">{item.address}</span>
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${item.severity === 'Critical' ? 'bg-red-100 text-red-700' : item.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-3/5 h-[40vh] md:h-full relative">
        <MapView 
           markers={MOCK_PREVIEW_REPORTS} 
           focusedMarkerId={hoveredId} 
           center={[23.3321, 86.3652]}
           zoom={12}
        />
      </div>
    </div>
  );
}
