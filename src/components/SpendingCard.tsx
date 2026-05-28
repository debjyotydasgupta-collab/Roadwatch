import { RoadProject } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SpendingCard({ project }: { project: RoadProject & { contractor: string } }) {
  const percentUsed = Math.min(100, Math.round((project.used_amount / project.budget_amount) * 100));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(project.region === "IN" ? "en-IN" : "en-US", {
      style: "currency",
      currency: project.region === "IN" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant="outline" className="text-[10px]">{project.road_type}</Badge>
        </div>
        <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" /> {project.contractor}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-3.5 w-3.5" /> Last relayed: {new Date(project.last_relaying_date).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Total Budget ({project.budget_source})</span>
            <span className="font-semibold">{formatCurrency(project.budget_amount)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Used</span>
            <span className="font-semibold text-primary">{formatCurrency(project.used_amount)}</span>
          </div>
        </div>
        
        <Progress value={percentUsed} className="h-2 w-full" />
        
        <div className="mt-2 text-right text-xs font-medium text-muted-foreground">
          {percentUsed}% utilized
        </div>
      </CardContent>
    </Card>
  );
}
