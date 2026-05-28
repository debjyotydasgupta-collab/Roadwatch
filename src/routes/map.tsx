import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapView, MapMarker } from "@/components/MapView";
import { mockApi, Complaint } from "@/lib/mock-api";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(13);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    mockApi.getComplaints().then(data => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapZoom(13);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markers: MapMarker[] = filteredComplaints.map(c => ({
    id: c.id,
    lat: c.location_lat,
    lon: c.location_lon,
    title: c.title,
    severity: c.severity,
    status: c.status,
  }));

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-muted">
      {/* Full-screen map container */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MapView 
            markers={markers} 
            showHeatmap={showHeatmap}
            height="100vh"
            center={mapCenter}
            zoom={mapZoom}
          />
        )}
      </div>

      {/* Floating UI Card in top-left */}
      <div className="absolute top-4 left-4 z-10 w-[calc(100vw-2rem)] max-w-sm">
        <Card className="shadow-lg border-none bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/95">
          <CardHeader className="pb-3 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-primary">Live Road Issues</CardTitle>
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
            
            <form onSubmit={handleSearch} className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
              <Input 
                type="search" 
                placeholder="Search city or pincode..." 
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2 border-t mt-2 pt-4">
              <Label htmlFor="heatmap" className="font-medium cursor-pointer">Show Heatmap</Label>
              <Switch id="heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
