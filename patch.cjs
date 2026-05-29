const fs = require('fs');
let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

// 1. Add missing imports
if (!code.includes('MapView')) {
  code = code.replace(
    'import { Navbar } from "@/components/Navbar";',
    'import { Navbar } from "@/components/Navbar";\nimport { MapView, MapMarker } from "@/components/MapView";'
  );
}
if (!code.includes('ExternalLink')) {
  code = code.replace(
    'Send,',
    'Send,\n  ExternalLink,'
  );
}

// 2. Add Telegram Button to Hero Section
const heroButtons = `<Link to="/chat">
                  <Button size="lg" variant="outline">
                    AI Assistant
                  </Button>
                </Link>
                <a href="https://t.me/roadwatch_ai_bot" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-[#229ED9] hover:bg-[#1c88ba] text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Telegram Bot
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>`;
code = code.replace(
  /<Link to="\/chat">\s*<Button size="lg" variant="outline">\s*AI Assistant\s*<\/Button>\s*<\/Link>/g,
  heroButtons
);

// 3. Add dialogClassName to FeatureTile props
if (!code.includes('dialogClassName?: string;')) {
  code = code.replace(
    'dialogDesc?: string;',
    'dialogDesc?: string;\n  dialogClassName?: string;'
  );
  code = code.replace(
    'dialogDesc,\n}: {',
    'dialogDesc,\n  dialogClassName,\n}: {'
  );
  code = code.replace(
    '<DialogContent className="sm:max-w-md">',
    '<DialogContent className={dialogClassName || "sm:max-w-md"}>'
  );
}

// 4. Inject GeoReportsLivePreview logic
const geoReportsCode = `
const MOCK_PREVIEW_REPORTS: MapMarker[] = [
  {
    id: "rep-1",
    title: "Deep Pothole",
    address: "Ward 5, MG Road",
    severity: "Critical",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=100&q=80",
    lat: 23.3321,
    lon: 86.3652,
    status: "Reported"
  },
  {
    id: "rep-2",
    title: "Waterlogging",
    address: "Sector 4, Outer Ring Road",
    severity: "Moderate",
    image_url: "https://images.unsplash.com/photo-1584984277749-923f66c9ffae?w=100&q=80",
    lat: 23.3250,
    lon: 86.3740,
    status: "In Progress"
  },
  {
    id: "rep-3",
    title: "Cracked Surface",
    address: "27th Main, HSR Layout",
    severity: "Minor",
    image_url: "https://images.unsplash.com/photo-1596788068872-2f3b925bdf25?w=100&q=80",
    lat: 23.3121,
    lon: 86.3846,
    status: "Reported"
  },
  {
    id: "rep-4",
    title: "Sinkhole",
    address: "Koramangala 1st Block",
    severity: "Critical",
    image_url: "https://images.unsplash.com/photo-1502877338593-d290670bfb61?w=100&q=80",
    lat: 23.3279,
    lon: 86.3571,
    status: "Reported"
  },
];

function GeoReportsLivePreview() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 overflow-hidden rounded-b-lg">
      <div className="w-full md:w-2/5 border-r bg-white flex flex-col h-[40vh] md:h-full">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 tracking-wider">LIVE FEED</span>
          </div>
          <span className="text-xs text-muted-foreground">{MOCK_PREVIEW_REPORTS.length} issues detected</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {MOCK_PREVIEW_REPORTS.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={\`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer \${hoveredId === item.id ? 'bg-primary/5 border-primary/30 shadow-md scale-[1.02]' : 'bg-white hover:bg-slate-50'}\`}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                {item.severity === "Critical" && (
                   <div className="absolute inset-0 border-2 border-red-500 rounded-md animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate text-slate-900">{item.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center mt-1 truncate">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> <span className="truncate">{item.address}</span>
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={\`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider \${item.severity === 'Critical' ? 'bg-red-100 text-red-700' : item.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}\`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-3/5 h-[40vh] md:h-full relative">
        <MapView 
           markers={MOCK_PREVIEW_REPORTS} 
           focusedMarkerId={hoveredId} 
           center={[23.3321, 86.3652]}
           zoom={12}
        />
      </div>
    </div>
  );
}
`;

if (!code.includes('function GeoReportsLivePreview')) {
  code = code + '\n' + geoReportsCode;
}

// 5. Replace static list with GeoReportsLivePreview
const regexStaticList = /<div className="space-y-4 mt-2 max-h-\[60vh\] overflow-y-auto pr-2\">[\s\S]*?<\/div>\s*<\/FeatureTile>/;
const newFeatureTile = `<FeatureTile
                  icon={<MapPin />}
                  title="Geo-tagged reports"
                  body="GPS pin + AI image analysis."
                  isInteractive
                  dialogTitle="Live Feed Preview"
                  dialogDesc="Real-time geo-spatial tracking of reported issues."
                  dialogClassName="sm:max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden"
                >
                  <GeoReportsLivePreview />
                </FeatureTile>`;
                
code = code.replace(regexStaticList, newFeatureTile);

fs.writeFileSync('src/routes/index.tsx', code);
console.log('Successfully applied updates to index.tsx');
