import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  LayoutDashboard, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  Menu,
  X,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

// Mock data for the detailed data table
const MOCK_ISSUES = [
  {
    id: "RW-1042",
    photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=150&q=80",
    location: "MG Road, near Metro Station",
    severity: "HIGH",
    status: "Reported"
  },
  {
    id: "RW-1043",
    photo: "https://images.unsplash.com/photo-1584984277749-923f66c9ffae?w=150&q=80",
    location: "1st Cross, Koramangala Block 5",
    severity: "MODERATE",
    status: "In Progress"
  },
  {
    id: "RW-1044",
    photo: "https://images.unsplash.com/photo-1596788068872-2f3b925bdf25?w=150&q=80",
    location: "Outer Ring Road (Sector 4)",
    severity: "HIGH",
    status: "In Progress"
  },
  {
    id: "RW-1045",
    photo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&q=80",
    location: "HSR Layout, 27th Main",
    severity: "MODERATE",
    status: "Resolved"
  },
  {
    id: "RW-1046",
    photo: "https://images.unsplash.com/photo-1502877338593-d290670bfb61?w=150&q=80",
    location: "Indiranagar 100ft Road",
    severity: "HIGH",
    status: "Reported"
  }
];

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [issues, setIssues] = useState(MOCK_ISSUES);

  const handleStatusChange = (id: string, newStatus: string) => {
    setIssues(issues.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-10 px-2">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Authority Panel</span>
      </div>
      <nav className="flex-1 space-y-2">
        <Button variant="secondary" className="w-full justify-start text-left bg-slate-800 text-white hover:bg-slate-700">
          <LayoutDashboard className="w-5 h-5 mr-3 text-slate-300" />
          Overview
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800">
          <AlertCircle className="w-5 h-5 mr-3" />
          Open Complaints
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          Resolved
        </Button>
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold">Authority Panel</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
              <p className="text-muted-foreground mt-1">Manage and track road infrastructure issues.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Open Issues</CardTitle>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">142</div>
                  <p className="text-xs text-muted-foreground mt-1">+12 reported today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Critical Severity (AI Flagged)</CardTitle>
                  <Activity className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">38</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Repairs Verified</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">1,204</div>
                  <p className="text-xs text-muted-foreground mt-1">84% of total complaints resolved</p>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Photo</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>AI Severity</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium text-slate-600">{issue.id}</TableCell>
                          <TableCell>
                            <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarImage src={issue.photo} alt={issue.id} className="object-cover" />
                              <AvatarFallback>IMG</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="text-slate-700 font-medium">{issue.location}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={issue.severity === "HIGH" ? "destructive" : "secondary"}
                              className={issue.severity === "MODERATE" ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100" : ""}
                            >
                              {issue.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select 
                              value={issue.status} 
                              onValueChange={(val) => handleStatusChange(issue.id, val)}
                            >
                              <SelectTrigger className="w-[140px] ml-auto h-8 text-xs font-medium">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Reported">Reported</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
