import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SpendingCard, SpendingCardSkeleton } from "@/components/SpendingCard";
import { apiClient, ApiProject } from "@/lib/api-client";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/spending")({
  component: SpendingPage,
});

const LOADING_PHRASES = [
  "Connecting to municipal database...",
  "Analyzing local contracts...",
  "Finalizing data..."
];

function SpendingPage() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [pincode, setPincode] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      toast.error("Please enter a valid 6-digit Indian Pincode");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setLoadingPhraseIndex(0);
    setProjects([]);

    try {
      const data = await apiClient.getSpending(pincode);
      setProjects(data);
    } catch {
      toast.error("Failed to fetch budget data.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Public Spending</h1>
            <p className="text-muted-foreground mt-1">
              Track where your tax money is being spent on road repairs.
            </p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                maxLength={6}
                placeholder="Enter Indian Pincode..."
                className="pl-9 bg-background/50 border-primary/20 focus:border-primary transition-colors shadow-sm"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <Button type="submit" disabled={loading} className="premium-hover shadow-sm bg-[#229ED9] hover:bg-[#1c88ba] text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Track Funds
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex flex-col space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <SpendingCardSkeleton key={i} />
              ))}
            </div>
            <div className="flex justify-center items-center h-20">
              <p className="text-muted-foreground text-sm font-medium animate-pulse">
                {LOADING_PHRASES[loadingPhraseIndex]}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.length > 0 ? (
              projects.map((p, idx) => <SpendingCard key={idx} project={p} />)
            ) : hasSearched ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No projects found for this pincode.
              </div>
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Enter a pincode above to view local infrastructure budgets.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
