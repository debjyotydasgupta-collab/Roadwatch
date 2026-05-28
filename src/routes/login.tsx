import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAuth } from "@/hooks/use-auth";
import { User } from "@/lib/mock-api";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  const handleLogin = (role: "citizen" | "authority") => {
    const user: User = role === "citizen" 
      ? { id: "u1", name: "Citizen Doe", email: "citizen@example.com", role: "citizen" }
      : { id: "u2", name: "Admin Officer", email: "admin@example.com", role: "authority" };
    
    mockAuth.login(user);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Select a demo role to login instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={() => handleLogin("citizen")}>
              Login as Citizen
            </Button>
            <Button className="w-full" variant="outline" size="lg" onClick={() => handleLogin("authority")}>
              Login as Authority
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-4">
              This is a demo application. No password required.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
