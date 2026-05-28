import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SpendingCard } from "@/components/SpendingCard";
import { mockApi, RoadProject } from "@/lib/mock-api";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRegion } from "@/hooks/use-region";

export const Route = createFileRoute("/spending")({
  component: SpendingPage,
});

function SpendingPage() {
  const { region } = useRegion();
  const [projects, setProjects] = useState<(RoadProject & { contractor: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    mockApi.getSpending(region).then(data => {
      // Map contractor_name to contractor for the SpendingCard prop
      setProjects(data.map(p => ({ ...p, contractor: p.contractor_name })));
      setLoading(false);
    });
  }, [region]);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Public Spending</h1>
            <p className="text-muted-foreground mt-1">Track where your tax money is being spent on road repairs.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search projects..." 
              className="pl-9 bg-background"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length > 0 ? (
              filtered.map(p => <SpendingCard key={p.id} project={p} />)
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No projects found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
