import { useState, useEffect } from "react";
import { Scan, ChevronLeft, ChevronRight, CheckCircle2, Loader2, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIVerifiedRepairsViewer({ showAction = false }: { showAction?: boolean }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [analyzing, setAnalyzing] = useState(true);
  const [fundStatus, setFundStatus] = useState<"idle" | "processing" | "released">("idle");

  // Simulate AI analysis delay
  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleReleaseFunds = () => {
    setFundStatus("processing");
    setTimeout(() => {
      setFundStatus("released");
    }, 2000);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-slate-950 text-slate-200">
      
      {/* Left Panel: The Vision UI */}
      <div className="flex-1 relative flex flex-col p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-800/80">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-slate-200">Computer Vision Array</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">SYS_CAM_092</span>
        </div>
        
        <div className="relative w-full flex-1 min-h-[300px] md:min-h-0 rounded-xl overflow-hidden group border border-slate-700 shadow-2xl bg-black">
          {/* After Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1517482312628-9842a229a43a?w=800&q=80"
              alt="Fresh asphalt"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-green-400 px-3 py-1.5 text-xs font-mono rounded border border-green-500/30 z-10 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              POST-REPAIR
            </div>
          </div>

          {/* Before Image */}
          <div
            className="absolute inset-0 z-10"
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          >
            <img
              src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"
              alt="Deep pothole"
              className="w-full h-full object-cover sepia-[0.3] brightness-75"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-red-400 px-3 py-1.5 text-xs font-mono rounded border border-red-500/30 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              PRE-REPAIR
            </div>
          </div>

          {/* AI Scanning Animation Overlay */}
          {analyzing && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
            </div>
          )}

          {/* Custom Interactive Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-30 pointer-events-none transition-transform duration-75"
            style={{ left: `calc(${sliderPos}%)` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.4)] flex items-center justify-center">
              <div className="flex gap-1">
                <ChevronLeft className="w-3 h-3 text-blue-200" />
                <ChevronRight className="w-3 h-3 text-blue-200" />
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
          />
        </div>
      </div>

      {/* Right Panel: AI Analysis Console */}
      <div className="w-full md:w-96 flex flex-col p-4 md:p-6 bg-slate-900 relative overflow-y-auto">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center shadow-inner">
            {analyzing ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-green-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Gemini Vision</h2>
            <p className="text-sm font-mono text-slate-400 flex items-center gap-1">
              STATUS: {analyzing ? <span className="text-blue-400 animate-pulse">ANALYZING...</span> : <span className="text-green-400">VERIFIED</span>}
            </p>
          </div>
        </div>

        {!analyzing && (
          <div className="space-y-6 flex-1 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col">
            
            {/* Confidence Score */}
            <div className="bg-black/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500 mb-1">AI CONFIDENCE SCORE</div>
                <div className="text-3xl font-bold text-white tracking-tight">98.4<span className="text-slate-500 text-xl">%</span></div>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" stroke="currentColor" strokeDasharray="98.4, 100" strokeWidth="3" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <CheckCircle2 className="w-5 h-5 text-green-400 absolute" />
              </div>
            </div>

            {/* Extracted Metadata */}
            <div className="space-y-4">
              <div className="bg-black/20 p-3 rounded-lg border border-slate-800/50">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Defect Analysis</div>
                <div className="text-sm font-medium text-slate-200">Class 4 Pothole <span className="text-slate-500">→</span> Bitumen Restoration</div>
              </div>
              
              <div className="bg-black/20 p-3 rounded-lg border border-slate-800/50">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Financial Match</div>
                <div className="text-sm font-medium text-slate-200 flex justify-between">
                  <span>Invoice #INV-4921</span>
                  <span className="text-green-400">₹45,000</span>
                </div>
              </div>

              <div className="bg-black/20 p-3 rounded-lg border border-slate-800/50">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Geo-Spatial Match</div>
                <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  23.3321° N, 86.3652° E
                </div>
              </div>
            </div>

            {/* Action */}
            {showAction && (
              <div className="pt-4 border-t border-slate-800 mt-auto">
                {fundStatus === "idle" && (
                  <Button onClick={handleReleaseFunds} className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
                    Release Contractor Funds
                  </Button>
                )}
                {fundStatus === "processing" && (
                  <Button disabled className="w-full bg-blue-600/50 text-white cursor-not-allowed">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Authorizing Transfer...
                  </Button>
                )}
                {fundStatus === "released" && (
                  <div className="w-full bg-green-900/40 border border-green-500/50 text-green-400 p-3 rounded-md flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">₹45,000 Released</span>
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
