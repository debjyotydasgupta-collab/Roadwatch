import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Navigation, Map as MapIcon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  title: string;
  severity: "Critical" | "Moderate" | "Minor" | string;
  status: string;
  address?: string;
  image_url?: string;
  created_at?: string;
  onClick?: () => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  Minor: "#22c55e",
  Moderate: "#eab308",
  Critical: "#dc2626",
  low: "#22c55e",
  medium: "#eab308",
  high: "#dc2626",
};

const SEVERITY_SHADOW: Record<string, string> = {
  Minor: "rgba(34, 197, 94, 0.4)",
  Moderate: "rgba(234, 179, 8, 0.4)",
  Critical: "rgba(220, 38, 38, 0.6)",
  low: "rgba(34, 197, 94, 0.4)",
  medium: "rgba(234, 179, 8, 0.4)",
  high: "rgba(220, 38, 38, 0.6)",
};

interface Props {
  markers: MapMarker[];
  showHeatmap?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  focusedMarkerId?: string | null;
  onMapClick?: (lat: number, lon: number) => void;
}

export function MapView({
  markers,
  showHeatmap = false,
  center = [23.3321, 86.3652],
  zoom = 13,
  height = "100%",
  focusedMarkerId,
  onMapClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const LRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [isLocating, setIsLocating] = useState(false);
  const [localHeatmap, setLocalHeatmap] = useState(showHeatmap);

  useEffect(() => {
    setLocalHeatmap(showHeatmap);
  }, [showHeatmap]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    
    let isMounted = true;
    
    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      await import("leaflet.heat");
      
      if (!isMounted || !ref.current) return;
      LRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(ref.current, { zoomControl: false }).setView(center, zoom);
      
      // Move zoom control to bottom left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      
      const themeUrl = mapTheme === "dark" 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const tileLayer = L.tileLayer(themeUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);
      
      tileLayerRef.current = tileLayer;
      mapRef.current = map;
      
      if (onMapClick) {
        map.on("click", (e: any) => onMapClick(e.latlng.lat, e.latlng.lng));
      }
    }
    
    initMap();
    
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle map theme switching
  useEffect(() => {
    if (tileLayerRef.current) {
      const themeUrl = mapTheme === "dark" 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      tileLayerRef.current.setUrl(themeUrl);
    }
  }, [mapTheme]);

  // Handle center and zoom prop changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo(center, zoom || 13, { animate: true, duration: 1.5 });
    }
  }, [center, zoom]);

  // Handle flying to selected marker
  useEffect(() => {
    if (mapRef.current && focusedMarkerId) {
      const markerData = markers.find(m => m.id === focusedMarkerId);
      if (markerData) {
        mapRef.current.flyTo([markerData.lat, markerData.lon], 16, { animate: true, duration: 1.5 });
        
        const leafletMarker = markersRef.current[focusedMarkerId];
        if (leafletMarker) {
          setTimeout(() => leafletMarker.openPopup(), 300);
        }
      }
    }
  }, [focusedMarkerId, markers]);

  // Handle rendering markers and clusters
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if ((map as any)._clusterLayer) map.removeLayer((map as any)._clusterLayer);
    if ((map as any)._heatLayer) map.removeLayer((map as any)._heatLayer);

    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      iconCreateFunction: function (clusterGroup: any) {
        const count = clusterGroup.getChildCount();
        const size = count > 50 ? 50 : count > 10 ? 45 : 40;
        
        // Dark theme needs inverse styling for clusters
        const bgColor = mapTheme === "dark" ? "#1e293b" : "white";
        const textColor = mapTheme === "dark" ? "white" : "#0f172a";
        const borderColor = mapTheme === "dark" ? "#475569" : "#0f172a";

        return L.divIcon({
          html: `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; border: 3px solid ${borderColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${textColor}; font-size: 14px; transition: all 0.3s ease;"><span>${count}</span></div>`,
          className: "custom-marker-cluster",
          iconSize: L.point(size, size, true),
        });
      }
    });

    markers.forEach((m) => {
      const color = SEVERITY_COLOR[m.severity] || "#000";
      const shadow = SEVERITY_SHADOW[m.severity] || "rgba(0,0,0,0.4)";
      const isCritical = m.severity === "Critical" || m.severity === "high";
      
      const iconHtml = isCritical 
        ? `<div class="radar-ping-container">
             <div class="radar-ping" style="background: ${color};"></div>
             <div style="width: 24px; height: 24px; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 0 12px ${shadow}, 0 2px 6px rgba(0,0,0,0.2); position: relative; z-index: 2;"></div>
           </div>`
        : `<div style="width: 24px; height: 24px; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 0 12px ${shadow}, 0 2px 6px rgba(0,0,0,0.2);"></div>`;

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });
      
      const marker = L.marker([m.lat, m.lon], { icon }).bindPopup(
        `<div style="min-width: 220px; font-family: 'Inter', sans-serif;">
          ${m.image_url ? `<div style="width: calc(100% + 40px); margin: -20px -20px 12px -20px; height: 140px; overflow: hidden; border-radius: 12px 12px 0 0;">
            <img src="${m.image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <strong style="font-size: 16px; text-transform: capitalize; color: #0f172a;">${m.title}</strong>
            <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${m.severity}</span>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: #334155; line-height: 1.4;">${m.address || 'Location Details'}</div>
          ${m.created_at ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${new Date(m.created_at).toLocaleString()}</div>` : ''}
          <div style="margin-top: 12px; font-size: 13px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${m.status === 'Resolved' ? '#22c55e' : m.status === 'In Progress' ? '#3b82f6' : '#eab308'};"></span>
            <span style="text-transform: capitalize; font-weight: 500; color: #475569;">${m.status}</span>
          </div>
         </div>`,
         { className: 'premium-popup' }
      );
      
      if (m.onClick) marker.on("click", m.onClick);
      markersRef.current[m.id] = marker;
      cluster.addLayer(marker);
    });
    
    map.addLayer(cluster);
    (map as any)._clusterLayer = cluster;

    if (localHeatmap && markers.length > 0) {
      const points = markers.map((m) => [m.lat, m.lon, (m.severity === "high" || m.severity === "Critical") ? 1 : (m.severity === "medium" || m.severity === "Moderate") ? 0.6 : 0.3]);
      const heat = L.heatLayer(points, { 
        radius: 35, 
        blur: 25, 
        gradient: mapTheme === "dark" 
          ? { 0.4: 'blue', 0.6: 'cyan', 0.8: 'yellow', 1.0: 'red' }
          : { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' } 
      });
      heat.addTo(map);
      (map as any)._heatLayer = heat;
    }

  }, [markers, localHeatmap, mapTheme, mapRef.current, LRef.current]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current || !LRef.current) return;
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        const L = LRef.current;

        map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
        
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div class="radar-ping-container">
                   <div class="radar-ping" style="background: #3b82f6; animation-duration: 2s;"></div>
                   <div style="width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); position: relative; z-index: 2;"></div>
                 </div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", minHeight: "400px" }}>
      <div ref={ref} style={{ height: "100%", width: "100%", minHeight: "400px", borderRadius: "12px", overflow: "hidden" }} />
      
      {/* Floating Action Menu Overlay */}
      <div className="absolute right-4 bottom-6 z-[1000] flex flex-col gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg h-12 w-12 bg-white/90 backdrop-blur-md hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
                onClick={() => setLocalHeatmap(!localHeatmap)}
              >
                <Layers className={`h-5 w-5 ${localHeatmap ? "text-primary" : "text-slate-600 dark:text-slate-400"}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle Heatmap</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg h-12 w-12 bg-white/90 backdrop-blur-md hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
                onClick={handleLocateMe}
                disabled={isLocating}
              >
                <Navigation className={`h-5 w-5 text-blue-600 ${isLocating ? "animate-pulse" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Locate Me</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-lg h-12 w-12 bg-white/90 backdrop-blur-md hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
                onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
              >
                {mapTheme === "light" ? (
                  <Moon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 0;
          overflow: hidden;
        }
        .premium-popup .leaflet-popup-content {
          margin: 20px;
        }
        .premium-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .leaflet-container {
          z-index: 10;
        }
        
        /* Radar Pulse Animation */
        .radar-ping-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .radar-ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: radar-pulse 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          opacity: 0.6;
          z-index: 1;
        }
        @keyframes radar-pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
