import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ComplaintCard } from "@/components/ComplaintCard";
import { mockApi, Complaint } from "@/lib/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "verified">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const load = () => {
    if (!user) return;
    setLoading(true);
    mockApi.getComplaints().then((data) => {
      setComplaints(data.filter((c) => c.user_id === user.id));
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My reports</h1>
            <p className="text-muted-foreground mt-1">Track status and earn civic points</p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Card className="md:w-auto">
              <CardContent className="py-3 px-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-lg">{user.points}</span>
                <span className="text-sm text-muted-foreground">points</span>
              </CardContent>
            </Card>
            <Button 
              size="sm" 
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
              onClick={() => toast.success("🎁 Partner Integration Coming Soon!")}
            >
              Redeem Rewards
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({complaints.filter((c) => c.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              In progress ({complaints.filter((c) => c.status === "resolved").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({complaints.filter((c) => c.status === "verified").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-8 pb-8">
            {filtered.map((c) => (
              <div key={c.id} className="relative pl-6 md:pl-8">
                <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-4 border-2 border-background" />
                <ComplaintCard
                  complaint={c}
                  complaintId={c.id}
                  onUpvote={load}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center">
            <Filter className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              {filter === "all"
                ? "You haven't reported any issues yet."
                : `No ${filter} reports.`}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: "/report" })}>Report an issue</Button>
              <Link to="/map">
                <Button variant="outline">View map</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
