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
  severity: "Critical" | "Moderate" | "Minor" | string;
  status: string;
  address?: string;
  photo_url?: string;
  onClick?: () => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  Minor: "#22c55e",
  Moderate: "#f59e0b",
  Critical: "#ef4444",
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
        `<div style="min-width: 220px; font-family: 'Inter', sans-serif;">
          ${m.photo_url ? `<div style="width: calc(100% + 40px); margin: -20px -20px 12px -20px; height: 140px; overflow: hidden; border-radius: 12px 12px 0 0;">
            <img src="${m.photo_url}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <strong style="font-size: 16px; text-transform: capitalize; color: var(--color-foreground);">${m.title}</strong>
            <span style="background: ${SEVERITY_COLOR[m.severity] || '#000'}20; color: ${SEVERITY_COLOR[m.severity] || '#000'}; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${m.severity}</span>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.4;">${m.address || 'Location Details'}</div>
          <div style="margin-top: 12px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${m.status === 'Resolved' ? '#22c55e' : m.status === 'In Progress' ? '#f59e0b' : '#3b82f6'};"></span>
            <span style="text-transform: capitalize; font-weight: 500; color: #334155;">${m.status}</span>
          </div>
          <div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
            <a href="/spending" style="color:var(--color-primary);text-decoration:none;font-size:13px;font-weight:600;display:block;padding:6px;border-radius:6px;transition:all 0.2s;background:#f8fafc;">View Regional Budget</a>
          </div>
         </div>`,
         { className: 'premium-popup' }
      );
      if (m.onClick) marker.on("click", m.onClick);
      cluster.addLayer(marker);
    });
    map.addLayer(cluster);

    let heat: L.Layer | null = null;
    if (showHeatmap && markers.length > 0) {
      const points = markers.map((m) => [m.lat, m.lon, (m.severity === "high" || m.severity === "Critical") ? 1 : (m.severity === "medium" || m.severity === "Moderate") ? 0.6 : 0.3]);
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
