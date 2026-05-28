import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ComplaintCard } from "@/components/ComplaintCard";
import { mockApi, Complaint } from "@/lib/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && role !== "authority") {
      navigate({ to: "/" });
      toast.error("Unauthorized access");
    }
  }, [role, authLoading, navigate]);

  const loadData = () => {
    setLoading(true);
    mockApi.getComplaints().then(data => {
      setComplaints(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (role === "authority") {
      loadData();
    }
  }, [role]);

  const handleResolve = async (id: string) => {
    try {
      await mockApi.updateComplaintStatus(id, "resolved");
      toast.success("Complaint marked as resolved");
      loadData();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      // Mocking verification with a fake image
      await mockApi.updateComplaintStatus(id, "verified", "mock-after-image");
      toast.success("Repair verified successfully");
      loadData();
    } catch (e) {
      toast.error("Failed to verify repair");
    }
  };

  if (authLoading || role !== "authority") return null;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Authority Dashboard</h1>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>

          {["pending", "resolved", "verified"].map(statusTab => (
            <TabsContent key={statusTab} value={statusTab}>
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {complaints.filter(c => c.status === statusTab).length > 0 ? (
                    complaints
                      .filter(c => c.status === statusTab)
                      .map(c => (
                        <ComplaintCard key={c.id} complaint={c}>
                          {c.status === "pending" && (
                            <Button className="w-full mt-2" size="sm" onClick={() => handleResolve(c.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                            </Button>
                          )}
                          {c.status === "resolved" && (
                            <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => handleVerify(c.id)}>
                              <Camera className="w-4 h-4 mr-2" /> Upload After-Photo (Verify)
                            </Button>
                          )}
                        </ComplaintCard>
                      ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      No complaints found in this category.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
