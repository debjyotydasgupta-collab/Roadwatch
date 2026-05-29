import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapView, MapMarker } from "@/components/MapView";
import { apiClient, ApiComplaint } from "@/lib/api-client";
import { mockApi } from "@/lib/mock-api";
import { Navbar } from "@/components/Navbar";
import { Loader2, ArrowLeft, Search, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(13);
  const [isSearching, setIsSearching] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    mockApi.getComplaints().then((fallback) => {
      apiClient.getComplaints(fallback).then((data) => {
        setComplaints(data);
        setLoading(false);
      });
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();

      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapZoom(13);
      } else {
        toast.error("Location not found");
      }
    } catch {
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.toLowerCase();
      const textMatch =
        !q ||
        c.issue_type.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q);
      const statusMatch = statusFilter === "all" || c.status === statusFilter;
      const severityMatch = severityFilter === "all" || c.severity === severityFilter;
      return textMatch && statusMatch && severityMatch;
    });
  }, [complaints, searchQuery, statusFilter, severityFilter]);

  const stats = useMemo(
    () => ({
      total: filteredComplaints.length,
      critical: filteredComplaints.filter((c) => c.severity === "Critical").length,
      resolved: filteredComplaints.filter((c) => c.status === "Resolved").length,
    }),
    [filteredComplaints],
  );

  const markers: MapMarker[] = filteredComplaints.map((c) => ({
    id: c.id,
    lat: c.latitude,
    lon: c.longitude,
    title: c.issue_type,
    severity: c.severity,
    status: c.status,
    address: c.address,
    photo_url: c.photo_url,
  }));

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-muted">
      <div className="absolute top-0 left-0 right-0 z-20">
        <Navbar />
      </div>

      <div className="absolute inset-0 z-0 pt-14">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MapView
            markers={markers}
            showHeatmap={showHeatmap}
            height="calc(100vh - 3.5rem)"
            center={mapCenter}
            zoom={mapZoom}
          />
        )}
      </div>

      <div className="absolute top-20 left-4 z-10 w-[calc(100vw-2rem)] max-w-sm">
        {panelOpen ? (
          <Card className="shadow-lg border-none bg-white/95 backdrop-blur-md dark:bg-slate-950/95">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-primary">Live road issues</CardTitle>
                <div className="flex gap-1">
                  <Link to="/report">
                    <Button size="sm" className="h-8">
                      Report
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setPanelOpen(false)}
                  >
                    Hide
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{stats.total} shown</Badge>
                <Badge variant="destructive">{stats.critical} critical</Badge>
                <Badge className="bg-green-600">{stats.resolved} resolved</Badge>
              </div>

              <form onSubmit={handleSearch} className="relative">
                {isSearching ? (
                  <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="search"
                  placeholder="Search city, ward, or issue…"
                  className="pl-9 bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="In Progress">In progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severity</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <Label htmlFor="heatmap" className="font-medium cursor-pointer text-sm">
                  Heatmap
                </Label>
                <Switch id="heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
              </div>
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setPanelOpen(true)} className="shadow-lg">
            <Filter className="h-4 w-4 mr-2" /> Filters ({stats.total})
          </Button>
        )}
      </div>
    </div>
  );
}
