import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { mockApi, TrafficLaw } from "@/lib/mock-api";
import { useRegion } from "@/hooks/use-region";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Scale, Car, Search, Globe, Calculator } from "lucide-react";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const { region } = useRegion();
  const [laws, setLaws] = useState<TrafficLaw[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    mockApi.getTrafficLaws(region).then(setLaws);
    setSelected(new Set());
  }, [region]);

  const filteredLaws = useMemo(() => {
    const q = search.toLowerCase().trim();
    return laws.filter((l) => {
      const matchVehicle =
        vehicleFilter === "All" || l.vehicle_type === vehicleFilter || l.vehicle_type === "All";
      const matchQuery =
        !q ||
        l.violation.toLowerCase().includes(q) ||
        l.consequence.toLowerCase().includes(q);
      return matchVehicle && matchQuery;
    });
  }, [laws, vehicleFilter, search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(region === "IN" ? "en-IN" : "en-US", {
      style: "currency",
      currency: region === "IN" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleLaw = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalFine = laws
    .filter((l) => selected.has(l.id))
    .reduce((sum, l) => sum + l.fine_amount, 0);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Traffic challan calculator</h1>
            <p className="text-muted-foreground">
              Search fines, select violations, and estimate total compounding fees.
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Globe className="w-4 h-4 mr-1" /> {region === "IN" ? "India" : "Global"}
          </Badge>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5" /> Estimated total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(totalFine)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {selected.size} violation{selected.size !== 1 ? "s" : ""} selected (indicative only)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5" /> Search & filter
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search violation or consequence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:flex-1"
            />
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All vehicles</SelectItem>
                <SelectItem value="Two-Wheeler">Two-wheeler</SelectItem>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredLaws.map((law) => (
            <Card
              key={law.id}
              className={`hover:shadow-md transition-shadow ${selected.has(law.id) ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex gap-3 items-start">
                  <Checkbox
                    id={law.id}
                    checked={selected.has(law.id)}
                    onCheckedChange={() => toggleLaw(law.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={law.id} className="text-lg font-semibold leading-tight cursor-pointer">
                      {law.violation}
                    </Label>
                    <Badge variant="secondary" className="w-fit mt-2">
                      <Car className="w-3 h-3 mr-1" /> {law.vehicle_type}
                    </Badge>
                  </div>
                  <Scale className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="text-sm text-muted-foreground">Compounding fee</div>
                  <div className="text-2xl font-bold text-destructive">
                    {formatCurrency(law.fine_amount)}
                  </div>
                </div>
                <div className="text-sm border-t pt-2 mt-3">
                  <span className="font-semibold text-muted-foreground block mb-1">Consequence</span>
                  {law.consequence}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLaws.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No traffic laws match your search in this region.
          </div>
        )}
      </div>
    </div>
  );
}
