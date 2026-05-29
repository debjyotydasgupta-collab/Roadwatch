import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { mockApi } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Activity, CheckCircle2, Clock, Coins } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof mockApi.getAnalyticsDetailed>> | null>(
    null,
  );

  useEffect(() => {
    mockApi.getAnalyticsDetailed().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="p-8 text-center animate-pulse">Loading analytics…</div>
      </div>
    );
  }

  const resolutionRate =
    data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;

  const resolutionData = [
    { name: "Resolved / Verified", value: data.resolved, color: "#10b981" },
    { name: "Pending", value: data.pending, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transparency analytics</h1>
          <p className="text-muted-foreground">
            Live metrics from citizen reports in your demo dataset.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total reports</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.total}</div>
              <p className="text-xs text-muted-foreground">All time in system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Resolution rate</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">{data.resolved} closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending action</CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting authority review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Civic points</CardTitle>
              <Coins className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{data.pointsAwarded}</div>
              <p className="text-xs text-muted-foreground">Awarded to citizens</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resolution status</CardTitle>
              <CardDescription>Share of open vs closed complaints</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issues by category</CardTitle>
              <CardDescription>From actual complaint types</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary)"
                    radius={[0, 4, 4, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Weekly report volume</CardTitle>
              <CardDescription>Citizen engagement trend (demo)</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
