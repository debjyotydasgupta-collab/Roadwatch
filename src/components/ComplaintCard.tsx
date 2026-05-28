import { Complaint, mockApi } from "@/lib/mock-api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Image as ImageIcon, ThumbsUp, HardHat } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-800",
  resolved: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
};

export function ComplaintCard({ complaint: initialComplaint, children }: { complaint: Complaint; children?: React.ReactNode }) {
  const [complaint, setComplaint] = useState(initialComplaint);
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const updated = await mockApi.upvoteComplaint(complaint.id);
      setComplaint(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setUpvoting(false);
    }
  };
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{complaint.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" /> {complaint.location_lat.toFixed(4)}, {complaint.location_lon.toFixed(4)}
            </CardDescription>
          </div>
          <Badge className={SEVERITY_COLORS[complaint.severity]} variant="outline">
            {complaint.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 text-sm text-muted-foreground space-y-3">
        <p className="line-clamp-2">{complaint.description}</p>
        
        {complaint.assigned_engineer && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <HardHat className="h-3.5 w-3.5" />
            Assigned to: {complaint.assigned_engineer}
          </div>
        )}

        {complaint.status === "verified" && complaint.after_image_url ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Reported (Before)</span>
              <div className="h-20 bg-muted rounded-md flex items-center justify-center border">
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-green-600">Verified (After)</span>
              <div className="h-20 bg-green-50 rounded-md flex items-center justify-center border border-green-200">
                <ImageIcon className="h-4 w-4 text-green-500/50" />
              </div>
            </div>
          </div>
        ) : complaint.image_url ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" /> Has photo attached
          </div>
        ) : null}
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
              disabled={upvoting}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {complaint.upvotes}
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
