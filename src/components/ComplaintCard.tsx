import type { ApiComplaint } from "@/lib/api-client";
import type { Complaint } from "@/lib/mock-api";
import { normalizeComplaint } from "@/lib/complaint-utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  Minor: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Moderate: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Critical: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-800",
  resolved: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  Reported: "bg-slate-100 text-slate-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Resolved: "bg-green-100 text-green-800",
};

export function ComplaintCard({
  complaint: initialComplaint,
  children,
  complaintId,
  onUpvote,
}: {
  complaint: Complaint | ApiComplaint;
  children?: React.ReactNode;
  complaintId?: string;
  onUpvote?: () => void;
}) {
  const complaint = normalizeComplaint(initialComplaint);
  const [upvotes, setUpvotes] = useState(
    "upvotes" in initialComplaint ? initialComplaint.upvotes : 0,
  );
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (upvoting || !complaintId) return;
    setUpvoting(true);
    try {
      const { mockApi } = await import("@/lib/mock-api");
      const updated = await mockApi.upvoteComplaint(complaintId);
      setUpvotes(updated.upvotes);
      onUpvote?.();
      toast.success("Upvoted — helps prioritize this fix");
    } catch {
      toast.error("Could not upvote");
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg capitalize">{complaint.issue_type}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1 text-xs line-clamp-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />{" "}
              {complaint.address ||
                `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`}
            </CardDescription>
          </div>
          <Badge className={SEVERITY_COLORS[complaint.severity]} variant="outline">
            {complaint.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 text-sm text-muted-foreground space-y-3">
        {complaint.photo_url && (
          <div className="mt-2 relative h-32 w-full overflow-hidden rounded-md border">
            <img
              src={complaint.photo_url}
              alt="Issue"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 bg-muted/30 pt-3">
        <div className="flex w-full items-center justify-between">
          <Badge variant="secondary" className={STATUS_COLORS[complaint.status]}>
            {complaint.status.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={handleUpvote}
              disabled={upvoting || !complaintId}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {upvotes}
            </Button>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        {children && <div className="w-full pt-2">{children}</div>}
      </CardFooter>
    </Card>
  );
}
