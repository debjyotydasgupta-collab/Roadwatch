import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MapView } from "@/components/MapView";
import { apiClient, ApiComplaint } from "@/lib/api-client";
import { mockApi } from "@/lib/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle, TrendingUp, BarChart3, AlertTriangle, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && role !== "authority") {
      navigate({ to: "/" });
      toast.error("Unauthorized access");
    }
  }, [role, authLoading, navigate]);

  const loadData = () => {
    setLoading(true);
    mockApi.getComplaints().then((fallback) => {
      apiClient.getComplaints(fallback).then((data) => {
        setComplaints(data);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    if (role === "authority") {
      loadData();
    }
  }, [role]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateComplaintStatus(id, newStatus);
      toast.success("Status Updated", {
        description: `Complaint ${id.substring(0, 8)} is now ${newStatus}.`,
      });
      loadData();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const getSeverityData = () => {
    const counts = { Critical: 0, Moderate: 0, Minor: 0 };
    complaints.forEach((c) => {
      if (counts[c.severity as keyof typeof counts] !== undefined) {
        counts[c.severity as keyof typeof counts]++;
      }
    });
    return [
      { name: "Critical", value: counts.Critical, color: "#ef4444" },
      { name: "Moderate", value: counts.Moderate, color: "#f59e0b" },
      { name: "Minor", value: counts.Minor, color: "#22c55e" },
    ].filter((item) => item.value > 0);
  };

  const severityData = getSeverityData();
  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.issue_type.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalReports = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  if (authLoading || role !== "authority") return null;

  return (
    <div className="min-h-dvh bg-background/50">
      <Navbar />
      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Authority dashboard</h1>
            <p className="text-muted-foreground">
              Manage reports, update status, and track resolution metrics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Reported">Reported</SelectItem>
                <SelectItem value="In Progress">In progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Overview Section */}
        {!loading && totalReports > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="premium-shadow glass-card md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" /> Reports by Severity
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="premium-shadow glass-card flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalReports}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" /> Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card className="premium-shadow glass-card flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Resolution Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">{resolutionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" /> {resolvedCount} cases
                    resolved
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Map and Table Overhaul */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Map Component */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> Live Reports Map
            </h2>
            <Card className="premium-shadow glass-card flex-1 overflow-hidden min-h-[400px]">
              <MapView
                markers={filteredComplaints.map((c) => ({
                  id: c.id,
                  lat: c.latitude,
                  lon: c.longitude,
                  title: c.issue_type,
                  severity: c.severity,
                  status: c.status,
                  address: c.address,
                  photo_url: c.photo_url,
                }))}
              />
            </Card>
          </div>

          {/* Data Table */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" /> Complaints Data Table
            </h2>
            <Card className="premium-shadow glass-card overflow-hidden">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Issue</th>
                        <th className="px-4 py-3 font-medium">Severity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {complaints.length > 0 ? (
                        filteredComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground capitalize">
                                {c.issue_type}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {c.address || "Unknown"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  c.severity === "Critical"
                                    ? "bg-red-100 text-red-800"
                                    : c.severity === "Moderate"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {c.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  c.status === "Reported"
                                    ? "bg-blue-100 text-blue-800"
                                    : c.status === "In Progress"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {c.status === "Reported" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2"
                                  onClick={() => handleStatusChange(c.id, "In Progress")}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" /> Start
                                </Button>
                              )}
                              {c.status === "In Progress" && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleStatusChange(c.id, "Resolved")}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            No complaints found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
