import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  MessageSquareText,
  ShieldCheck,
  BarChart3,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <FeatureTile
                  icon={<MapPin />}
                  title="Geo-tagged reports"
                  body="GPS pin + AI image analysis."
                  isInteractive
                >
                  <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-2">
                    {[
                      {
                        type: "Pothole",
                        location: "Ward 5, MG Road",
                        severity: "Critical",
                        image:
                          "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&q=80",
                        colorClass: "bg-red-100 text-red-800 border-red-200",
                      },
                      {
                        type: "Waterlogging",
                        location: "Sector 4, Outer Ring Road",
                        severity: "Moderate",
                        image:
                          "https://images.unsplash.com/photo-1584984277749-923f66c9ffae?w=100&q=80",
                        colorClass: "bg-amber-100 text-amber-800 border-amber-200",
                      },
                      {
                        type: "Crack",
                        location: "27th Main, HSR Layout",
                        severity: "Minor",
                        image:
                          "https://images.unsplash.com/photo-1596788068872-2f3b925bdf25?w=100&q=80",
                        colorClass: "bg-blue-100 text-blue-800 border-blue-200",
                      },
                      {
                        type: "Pothole",
                        location: "Koramangala 1st Block",
                        severity: "Critical",
                        image:
                          "https://images.unsplash.com/photo-1502877338593-d290670bfb61?w=100&q=80",
                        colorClass: "bg-red-100 text-red-800 border-red-200",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-lg border bg-slate-50/50"
                      >
                        <img
                          src={item.image}
                          alt={item.type}
                          className="w-16 h-16 rounded-md object-cover shadow-sm border"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.type}</h4>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {item.location}
                          </p>
                        </div>
                        <div className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-white shadow-sm flex items-center justify-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${item.colorClass.split(" ")[0]}`}
                          ></span>
                          <span className={item.colorClass.split(" ")[1]}>{item.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                >
                  <BeforeAfterSlider />
                  <div className="mt-6 flex justify-center pb-2">
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-bold border border-green-200 shadow-sm">
                      <ShieldCheck className="w-6 h-6" />
                      AI Verified
                    </div>
                  </div>
                </FeatureTile>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] rounded-lg overflow-hidden group border shadow-inner bg-slate-100 mt-2">
      {/* After Image (Right/Bottom Layer) */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517482312628-9842a229a43a?w=600&q=80"
          alt="Fresh asphalt"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 bg-green-600/90 text-white px-3 py-1 text-xs font-bold rounded shadow-md z-10">
          Repaired: May 2026
        </div>
      </div>

      {/* Before Image (Left/Top Layer clipped) */}
      <div
        className="absolute inset-0 z-10"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80"
          alt="Deep pothole"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-3 bg-red-600/90 text-white px-3 py-1 text-xs font-bold rounded shadow-md">
          Reported: March 2026
        </div>
      </div>

      {/* Visual Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `calc(${sliderPos}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
          <div className="w-1 h-4 border-l border-r border-slate-400 opacity-50" />
        </div>
      </div>

      {/* Invisible Range Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />
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
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  isInteractive?: boolean;
  children?: React.ReactNode;
  href?: string;
  dialogTitle?: string;
  dialogDesc?: string;
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
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
