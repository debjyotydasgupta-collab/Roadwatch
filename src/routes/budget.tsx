import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, BadgeCheck, Calendar, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
});

// Mock realistic data tailored to the specific requirements
const MOCK_PROJECTS = [
  {
    id: "proj-1",
    road_name: "Outer Ring Road (Sector 4 to 9)",
    location: "Ward 56, Electronic City",
    contractor: "L&T Infrastructure",
    is_verified: true,
    status: "In Progress",
    funds_used: 45000000,
    funds_sanctioned: 60000000,
    expected_deadline: "Oct 2024",
  },
  {
    id: "proj-2",
    road_name: "Main High Street Resurfacing",
    location: "Downtown Core, Pincode 560001",
    contractor: "Metro BuildCorp",
    is_verified: true,
    status: "Completed",
    funds_used: 12500000,
    funds_sanctioned: 12500000,
    expected_deadline: "Jan 2024",
  },
  {
    id: "proj-3",
    road_name: "Lake View Road Extension",
    location: "Ward 42, Lake District",
    contractor: "Apex Contractors Ltd",
    is_verified: false,
    status: "Tender Stage",
    funds_used: 500000,
    funds_sanctioned: 20000000,
    expected_deadline: "Dec 2025",
  },
  {
    id: "proj-4",
    road_name: "Industrial Hub Bypass",
    location: "North Industrial Zone",
    contractor: "National Highways Authority",
    is_verified: true,
    status: "In Progress",
    funds_used: 180000000,
    funds_sanctioned: 350000000,
    expected_deadline: "Mar 2026",
  }
];

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Tender Stage": "bg-amber-100 text-amber-800 border-amber-200",
};

function BudgetPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.road_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-dvh bg-slate-50/50 pb-12">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Track Public Spending in Your Area
        </h1>
        <p className="mt-4 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
          Hold contractors accountable. See exactly where and how your tax money is being used for road infrastructure.
        </p>
        
        {/* Large Centered Search Bar */}
        <div className="mt-10 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <Input 
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-6 rounded-full text-lg shadow-xl border-none bg-white text-foreground focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="Enter Pincode or Ward Number..."
          />
        </div>
      </div>

      {/* Grid of Project Cards */}
      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const percentUsed = Math.min(100, Math.round((project.funds_used / project.funds_sanctioned) * 100));
            
            return (
              <Card key={project.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4 bg-white">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold leading-tight text-slate-800">
                        {project.road_name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-slate-500 mt-2 font-medium">
                        <Navigation className="w-4 h-4 mr-1 text-slate-400" />
                        {project.location}
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[project.status]}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="bg-slate-50/50 pt-6 pb-6">
                  {/* Financials & Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600">Funds Used: <span className="text-slate-900 font-bold">{formatCurrency(project.funds_used)}</span></span>
                      <span className="text-slate-500">Sanctioned: {formatCurrency(project.funds_sanctioned)}</span>
                    </div>
                    <Progress value={percentUsed} className="h-2.5 bg-slate-200" />
                    <div className="text-xs text-right text-slate-500 font-medium">
                      {percentUsed}% Utilized
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-white border-t p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contractor</p>
                      <div className="flex items-center font-medium text-slate-900 mt-0.5">
                        {project.contractor}
                        {project.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 ml-1.5" aria-label="Verified Contractor" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    Deadline: {project.expected_deadline}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-lg">
            No projects found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
