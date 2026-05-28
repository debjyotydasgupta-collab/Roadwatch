import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
// leaflet.heat lacks types
import "leaflet.heat";


export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  severity: "low" | "medium" | "high";
  status: string;
  onClick?: () => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

interface Props {
  markers: MapMarker[];
  showHeatmap?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMapClick?: (lat: number, lon: number) => void;
}

export function MapView({
  markers,
  showHeatmap = false,
  center = [12.9716, 77.5946],
  zoom = 13,
  height = "70vh",
  onMapClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    if (onMapClick) {
      map.on("click", (e) => onMapClick(e.latlng.lat, e.latlng.lng));
    }
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const cluster = (L as unknown as { markerClusterGroup: () => L.LayerGroup }).markerClusterGroup();
    markers.forEach((m) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${SEVERITY_COLOR[m.severity]};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
        iconSize: [22, 22],
      });
      const marker = L.marker([m.lat, m.lon], { icon }).bindPopup(
        `<strong>${m.title}</strong><br/>Severity: ${m.severity}<br/>Status: ${m.status}<br/><br/>
         <a href="/spending" style="color:var(--color-primary);text-decoration:underline;font-size:12px;font-weight:600;">View Regional Budget</a>`,
      );
      if (m.onClick) marker.on("click", m.onClick);
      cluster.addLayer(marker);
    });
    map.addLayer(cluster);

    let heat: L.Layer | null = null;
    if (showHeatmap && markers.length > 0) {
      const points = markers.map((m) => [m.lat, m.lon, m.severity === "high" ? 1 : m.severity === "medium" ? 0.6 : 0.3]);
      // @ts-expect-error leaflet.heat
      heat = L.heatLayer(points, { radius: 30, blur: 25 });
      heat!.addTo(map);
    }

    return () => {
      map.removeLayer(cluster);
      if (heat) map.removeLayer(heat);
    };
  }, [markers, showHeatmap]);

  return <div ref={ref} style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }} />;
}
