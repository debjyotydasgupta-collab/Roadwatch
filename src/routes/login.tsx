import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
    const user: User =
      role === "citizen"
        ? {
            id: "u1",
            name: "Citizen Doe",
            email: "citizen@example.com",
            role: "citizen",
            points: 150,
          }
        : {
            id: "u2",
            name: "Admin Officer",
            email: "admin@example.com",
            role: "authority",
            points: 0,
          };

    mockAuth.login(user);
    navigate({ to: role === "authority" ? "/admin" : "/timeline" });
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
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => handleLogin("authority")}
            >
              Login as Authority
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
            <div className="text-center text-xs text-muted-foreground">
              Demo mode — no password required.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
