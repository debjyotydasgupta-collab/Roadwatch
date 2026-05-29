import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SpendingCard, SpendingCardSkeleton } from "@/components/SpendingCard";
import { mockApi, RoadProject } from "@/lib/mock-api";
import { useRegion } from "@/hooks/use-region";
import { Search, BadgeCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ApiProject } from "@/lib/api-client";

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
});

function toApiProject(p: RoadProject): ApiProject {
  return {
    road_name: p.name,
    contractor_name: p.contractor_name,
    allocated_amount: p.budget_amount,
    used_amount: p.used_amount,
    deadline: p.last_relaying_date,
    status:
      p.used_amount >= p.budget_amount * 0.95
        ? "Completed"
        : p.used_amount > 0
          ? "In Progress"
          : "Tender Stage",
  };
}

function BudgetPage() {
  const { region } = useRegion();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    mockApi.getSpending(region).then((data) => {
      setProjects(data.map(toApiProject));
      setLoading(false);
    });
  }, [region]);

  const filtered = projects.filter(
    (p) =>
      !searchQuery.trim() ||
      p.road_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractor_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-dvh bg-slate-50/50 pb-12">
      <Navbar />
      <div className="bg-primary text-primary-foreground py-12 md:py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
          Public road budgets — {region === "IN" ? "India" : "Global"}
        </h1>
        <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
          Sanctioned vs utilized funds by project. For pincode-specific lookup, use{" "}
          <Link to="/spending" className="underline font-medium">
            Spending search
          </Link>
          .
        </p>
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 rounded-full bg-white text-foreground border-none shadow-lg"
            placeholder="Filter by road or contractor…"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 max-w-6xl">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SpendingCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length > 0 ? (
              filtered.map((p, idx) => <SpendingCard key={idx} project={p} />)
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                No projects match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/spending">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Search by Indian pincode
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
