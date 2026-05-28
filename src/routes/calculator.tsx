import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { mockApi, TrafficLaw } from "@/lib/mock-api";
import { useRegion } from "@/hooks/use-region";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scale, Car, Search } from "lucide-react";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const { region } = useRegion();
  const [laws, setLaws] = useState<TrafficLaw[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>("All");

  useEffect(() => {
    mockApi.getTrafficLaws(region).then(setLaws);
  }, [region]);

  const filteredLaws = laws.filter(l => vehicleFilter === "All" || l.vehicle_type === vehicleFilter || l.vehicle_type === "All");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(region === "IN" ? "en-IN" : "en-US", {
      style: "currency",
      currency: region === "IN" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Challan Calculator</h1>
          <p className="text-muted-foreground">Lookup compounding fees based on local regulations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Globe className="w-4 h-4 mr-1" /> Geo-fenced Region: {region === "IN" ? "India" : "Global"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" /> Filter by Vehicle
          </CardTitle>
          <CardDescription>Select your vehicle type to see applicable violations and fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Vehicles</SelectItem>
              <SelectItem value="Two-Wheeler">Two-Wheeler</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLaws.map((law) => (
          <Card key={law.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{law.violation}</CardTitle>
                <Scale className="w-4 h-4 text-muted-foreground" />
              </div>
              <Badge variant="secondary" className="w-fit mt-2">
                <Car className="w-3 h-3 mr-1" /> {law.vehicle_type}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground">Compounding Fee</div>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(law.fine_amount)}</div>
              </div>
              <div className="text-sm border-t pt-2 mt-3">
                <span className="font-semibold text-muted-foreground block mb-1">Consequence:</span>
                {law.consequence}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLaws.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No traffic laws found for this selection in the current region.
          </div>
        )}
      </div>
    </div>
  );
}

// Needed Globe icon here
import { Globe } from "lucide-react";
