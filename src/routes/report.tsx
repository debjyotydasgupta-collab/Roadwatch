import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { GpsPicker, type GpsLocation } from "@/components/GpsPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { submitReport } from "@/lib/report-service";
import { analyzeImage } from "@/lib/ai.functions";
import { mockApi } from "@/lib/mock-api";
import { toast } from "sonner";
import { Loader2, Shield, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

const STEPS = ["Details", "Location & photo", "Review"];

function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gps, setGps] = useState<GpsLocation | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pothole",
    severity: "medium" as "low" | "medium" | "high",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleImageAnalyze = async (dataUrl: string) => {
    setAnalyzing(true);
    try {
      let analysis: { issueType: string; severity: string; description: string };
      try {
        analysis = await analyzeImage({ data: { imageUrl: dataUrl } });
      } catch {
        analysis = await mockApi.analyzeImage(dataUrl);
      }
      setFormData((prev) => ({
        ...prev,
        type: analysis.issueType,
        severity: (["low", "medium", "high"].includes(analysis.severity)
          ? analysis.severity
          : "medium") as "low" | "medium" | "high",
        description: prev.description || analysis.description,
        title: prev.title || `Reported ${analysis.issueType}`,
      }));
      toast.success("AI classified your photo — review the fields below");
    } catch {
      toast.message("Photo saved. Add details manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const canNext =
    step === 0
      ? formData.title.trim() && formData.description.trim()
      : step === 1
        ? !!gps
        : true;

  const handleSubmit = async () => {
    if (!gps) {
      toast.error("Location is required");
      return;
    }
    setLoading(true);
    try {
      await submitReport({
        ...formData,
        location_lat: gps.lat,
        location_lon: gps.lon,
        user_id: user?.id ?? "guest",
        image_url: photo ?? undefined,
        title: gps.label ? `${formData.title} — ${gps.label}` : formData.title,
      });
      toast.success("Issue reported successfully!", {
        description: user ? "+10 civic points on verification" : "Log in to track on your timeline",
      });
      navigate({ to: "/map" });
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Report a road issue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <Progress value={progress} className="mt-3 h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{STEPS[step]}</CardTitle>
            <CardDescription>
              {step === 0 && "Describe what you found on the road."}
              {step === 1 && "Add GPS and photo evidence for faster repairs."}
              {step === 2 && "Confirm before sending to authorities."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Issue title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Deep pothole near junction"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Issue type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pothole">Pothole</SelectItem>
                      <SelectItem value="waterlogging">Waterlogging</SelectItem>
                      <SelectItem value="crack">Road crack</SelectItem>
                      <SelectItem value="streetlight">Broken streetlight</SelectItem>
                      <SelectItem value="debris">Debris / obstruction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v: "low" | "medium" | "high") =>
                      setFormData({ ...formData, severity: v })
                    }
                  >
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low — minor</SelectItem>
                      <SelectItem value="medium">Medium — needs attention</SelectItem>
                      <SelectItem value="high">High — dangerous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    placeholder="Describe the issue and landmarks nearby…"
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <GpsPicker value={gps} onChange={setGps} />
                <div className="space-y-2">
                  <Label>Photo evidence (optional, AI-assisted)</Label>
                  <ImageUpload
                    value={photo}
                    onChange={setPhoto}
                    onAnalyze={handleImageAnalyze}
                    analyzing={analyzing}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3 text-sm rounded-lg border p-4 bg-muted/30">
                <p>
                  <span className="font-medium">Title:</span> {formData.title}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {formData.type} ·{" "}
                  <span className="capitalize">{formData.severity}</span>
                </p>
                <p>
                  <span className="font-medium">Location:</span> {gps?.label ?? "Pinned"}
                </p>
                {photo && (
                  <img src={photo} alt="Preview" className="rounded-md h-32 w-full object-cover border" />
                )}
                <p className="flex items-start gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  Your report may be shared with municipal engineers. No personal data is sold.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-2">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading || !gps}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit report
              </Button>
            )}
          </CardFooter>
        </Card>

        {!user && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </Link>{" "}
            to track reports on your timeline and earn points.
          </p>
        )}
      </div>
    </div>
  );
}
