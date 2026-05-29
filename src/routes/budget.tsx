import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SpendingCard, SpendingCardSkeleton } from "@/components/SpendingCard";
import { apiClient, ApiProject } from "@/lib/api-client";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
});

const LOADING_PHRASES = [
  "Connecting to municipal database...",
  "Analyzing local contracts...",
  "Finalizing data..."
];

function BudgetPage() {
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
    <div className="min-h-dvh bg-slate-50/50 pb-12">
      <Navbar />
      <div className="bg-primary text-primary-foreground py-12 md:py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
          Public Road Budgets
        </h1>
        <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          Track sanctioned vs utilized funds for infrastructure projects by entering a pincode.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-12 rounded-full bg-white text-foreground border-none shadow-lg text-lg"
              placeholder="Enter 6-digit Pincode..."
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="h-12 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90 px-6">
            <Sparkles className="w-5 h-5 mr-2" />
            Track Funds
          </Button>
        </form>
      </div>

      <div className="container mx-auto px-4 mt-10 max-w-6xl">
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
              <div className="col-span-full py-16 text-center text-muted-foreground">
                No projects found for this pincode.
              </div>
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                Enter a pincode above to view local infrastructure budgets.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
