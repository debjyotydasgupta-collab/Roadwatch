import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ComplaintCard } from "@/components/ComplaintCard";
import { mockApi, Complaint } from "@/lib/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      mockApi.getComplaints().then(data => {
        // filter for just this user (in a real app)
        setComplaints(data.filter(c => c.user_id === user.id));
        setLoading(false);
      });
    }
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Reports Timeline</h1>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-8 pb-8">
                {complaints.map(c => (
                  <div key={c.id} className="relative pl-6 md:pl-8">
                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-4 border-2 border-background" />
                    <ComplaintCard complaint={c} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                <p className="text-muted-foreground mb-4">You haven't reported any issues yet.</p>
                <Button onClick={() => navigate({ to: "/report" })}>Report an Issue</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
