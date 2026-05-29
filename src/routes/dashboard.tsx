import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, AlertCircle, CheckCircle2, Menu, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient, ApiComplaint } from "@/lib/api-client";
import { mockApi } from "@/lib/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState<ApiComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && role !== "authority") {
      navigate({ to: "/login" });
      toast.error("Authority login required");
    }
  }, [role, authLoading, navigate]);

  const load = () => {
    mockApi.getComplaints().then((fallback) => {
      apiClient.getComplaints(fallback).then((data) => {
        setComplaints(data);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    if (role === "authority") load();
  }, [role]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await apiClient.updateComplaintStatus(id, newStatus);
    toast.success(`Updated to ${newStatus}`);
    load();
  };

  const openCount = complaints.filter((c) => c.status !== "Resolved").length;
  const criticalCount = complaints.filter((c) => c.severity === "Critical").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800 p-4">
      <Link to="/" className="flex items-center gap-2 mb-8 px-2 hover:opacity-80">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Authority Panel</span>
      </Link>
      <nav className="flex-1 space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-start bg-slate-800 text-white hover:bg-slate-700"
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Overview
        </Button>
        <Link to="/admin" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            Live admin map
          </Button>
        </Link>
        <Link to="/analytics" className="block">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <CheckCircle2 className="w-5 h-5 mr-3" />
            Analytics
          </Button>
        </Link>
      </nav>
    </div>
  );

  if (authLoading || role !== "authority") return null;

  return (
    <div className="flex h-dvh bg-slate-50">
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <span className="font-bold">Authority Panel</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard overview</h1>
              <p className="text-muted-foreground mt-1">Live complaint queue from API + demo fallback.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Open issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{openCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Critical (AI)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent complaints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Issue</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {complaints.slice(0, 10).map((issue) => (
                            <TableRow key={issue.id}>
                              <TableCell className="font-medium capitalize">{issue.issue_type}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{issue.address}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    issue.severity === "Critical" ? "destructive" : "secondary"
                                  }
                                >
                                  {issue.severity}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Select
                                  value={issue.status}
                                  onValueChange={(val) => handleStatusChange(issue.id, val)}
                                >
                                  <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                                    <SelectValue />
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
