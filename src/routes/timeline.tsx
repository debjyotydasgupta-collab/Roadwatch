import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ComplaintCard } from "@/components/ComplaintCard";
import { mockApi, Complaint as MockComplaint } from "@/lib/mock-api";
import { apiClient, ApiComplaint } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Filter, Coins, Trophy, Zap, CheckCircle2, AlertTriangle, FileWarning, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Pending" | "In Progress" | "Resolved">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch live complaints from backend, fallback to mock if DB fails/is missing
    const mockFallback = await mockApi.getComplaints();
    const liveData = await apiClient.getComplaints(mockFallback);
    
    // In a real app we filter by user.id, but for demo we show all or simulate ownership
    // We'll show all live data to ensure the demo works beautifully
    setComplaints(liveData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter || (filter === "Pending" && c.status === "Reported"));
  }, [complaints, filter]);

  if (authLoading || !user) return null;

  // Gamification logic
  const currentPoints = user.points || 0;
  const currentLevel = Math.floor(currentPoints / 100) + 1;
  const nextLevelPoints = currentLevel * 100;
  const progressPercent = (currentPoints / nextLevelPoints) * 100;

  const levelTitle = 
    currentLevel >= 5 ? "Civic Champion" :
    currentLevel >= 3 ? "Community Watcher" :
    currentLevel >= 2 ? "Active Citizen" : "Newcomer";

  return (
    <div className="min-h-dvh bg-slate-50/50 pb-20">
      <Navbar />
      
      {/* Gamified Hero Section */}
      <div className="bg-primary text-primary-foreground pt-12 pb-24 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-primary-foreground/20 shadow-xl backdrop-blur-sm">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-primary">
                  Lv. {currentLevel}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <p className="text-primary-foreground/80 font-medium mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {levelTitle}
                </p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl border border-amber-400/50 rounded-full px-6 flex items-center gap-2 transition-transform hover:scale-105"
              onClick={() => toast.success("🎁 Partner Integration Coming Soon! Connect your wallet next patch.")}
            >
              <Gift className="w-5 h-5" />
              Redeem Rewards
            </Button>
          </div>

          <div className="mt-10 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xl">{currentPoints}</span>
                <span className="text-primary-foreground/70 text-sm">civic points</span>
              </div>
              <div className="text-xs font-medium text-primary-foreground/80">
                {nextLevelPoints - currentPoints} pts to Level {currentLevel + 1}
              </div>
            </div>
            
            {/* Custom high-visibility progress bar */}
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 -mt-10 relative z-20">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <Card className="shadow-lg border-none bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="mx-auto w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <FileWarning className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{complaints.length}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reports</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="mx-auto w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{complaints.filter(c => c.status === "Resolved").length}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fixed</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="mx-auto w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600">High</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Impact</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-8">
          <TabsList className="bg-white shadow-sm border p-1 rounded-xl w-full flex">
            <TabsTrigger value="all" className="flex-1 rounded-lg">All</TabsTrigger>
            <TabsTrigger value="Pending" className="flex-1 rounded-lg text-amber-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">Pending</TabsTrigger>
            <TabsTrigger value="In Progress" className="flex-1 rounded-lg text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">In Progress</TabsTrigger>
            <TabsTrigger value="Resolved" className="flex-1 rounded-lg text-green-600 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">Syncing civic timeline...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-10 pb-8">
            {filtered.map((c, i) => {
              const isResolved = c.status === "Resolved";
              const isProgress = c.status === "In Progress";
              
              return (
                <div key={c.id} className={`relative pl-8 md:pl-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                  {/* Timeline Dot (perfectly centered on 2px border) */}
                  <div className={`absolute w-6 h-6 rounded-full -left-[11px] top-4 border-4 border-background flex items-center justify-center shadow-sm
                    ${isResolved ? 'bg-green-500' : isProgress ? 'bg-blue-500' : 'bg-slate-300'}`}
                  >
                    {isResolved && <div className="absolute w-full h-full rounded-full border-2 border-green-500 animate-ping opacity-20"></div>}
                    {isProgress && <div className="absolute w-full h-full rounded-full border-2 border-blue-500 animate-ping opacity-20"></div>}
                  </div>
                  
                  <div className="transform transition-transform hover:-translate-y-1 hover:shadow-xl rounded-xl">
                    <ComplaintCard
                      complaint={c as any}
                      complaintId={c.id}
                      onUpvote={load}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="py-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                {filter === "all" ? "Your Timeline is Empty" : `No ${filter} Reports`}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                {filter === "all"
                  ? "You haven't submitted any civic reports yet. Start reporting potholes and infrastructure issues to earn points and rank up!"
                  : `You don't have any reports matching the ${filter} status.`}
              </p>
              <div className="flex gap-3">
                <Button size="lg" className="rounded-full shadow-md" onClick={() => navigate({ to: "/report" })}>
                  Report an Issue
                </Button>
                <Link to="/map">
                  <Button size="lg" variant="outline" className="rounded-full bg-white">
                    Explore Live Map
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Quick helper icon for ShieldCheck that was missing
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2 0 4 1 7 2a1 1 0 0 1 1 1v7z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
