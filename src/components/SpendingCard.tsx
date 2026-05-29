import { ApiProject } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SpendingCard({ project }: { project: ApiProject }) {
  const percentUsed =
    project.used_amount != null && project.allocated_amount > 0
      ? Math.min(100, Math.round((project.used_amount / project.allocated_amount) * 100))
      : project.status === "Completed"
        ? 100
        : project.status === "In Progress"
          ? 45
          : 15;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="premium-hover premium-shadow glass-card transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.road_name}</CardTitle>
          <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
        </div>
        <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" /> {project.contractor_name}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CalendarDays className="h-3.5 w-3.5" /> Deadline: {project.deadline}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Allocated Budget</span>
            <span className="font-semibold">{formatCurrency(project.allocated_amount)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Est. Used</span>
            <span className="font-semibold text-primary">
              {formatCurrency(project.used_amount ?? project.allocated_amount * (percentUsed / 100))}
            </span>
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

export function SpendingCardSkeleton() {
  return (
    <Card className="premium-shadow glass-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full"></div>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
            <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="space-y-1 flex flex-col items-end">
            <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
            <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-2 w-full bg-muted animate-pulse rounded-full"></div>
        <div className="mt-3 flex justify-end">
          <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
