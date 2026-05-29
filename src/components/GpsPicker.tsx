import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { reverseGeocode } from "@/lib/ai.functions";

export interface GpsLocation {
  lat: number;
  lon: number;
  label?: string;
}

interface GpsPickerProps {
  value: GpsLocation | null;
  onChange: (loc: GpsLocation | null) => void;
}

export function GpsPicker({ value, onChange }: GpsPickerProps) {
  const [loading, setLoading] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let label: string | undefined;
        try {
          const geo = await reverseGeocode({ data: { lat, lon } });
          label = geo.roadName;
        } catch {
          label = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
        }
        onChange({ lat, lon, label });
        toast.success("Location captured");
        setLoading(false);
      },
      () => {
        toast.error("Could not get your location. Check browser permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          GPS location
        </div>
        <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Crosshair className="h-4 w-4 mr-1" />
          )}
          Use my location
        </Button>
      </div>
      {value ? (
        <div className="text-sm">
          <p className="font-medium text-foreground">{value.label ?? "Pinned location"}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {value.lat.toFixed(5)}, {value.lon.toFixed(5)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs"
            onClick={() => onChange(null)}
          >
            Clear
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Pin your exact location so crews can find the defect quickly.
        </p>
      )}
    </div>
  );
}
