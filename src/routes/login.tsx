import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockAuth } from "@/hooks/use-auth";
import { User } from "@/lib/mock-api";
import { Navbar } from "@/components/Navbar";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { LockKeyhole, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [showAuthorityInput, setShowAuthorityInput] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCitizenLogin = () => {
    const user: User = {
      id: "u1",
      name: "Citizen Doe",
      email: "citizen@example.com",
      role: "citizen",
      points: 150,
    };
    mockAuth.login(user);
    navigate({ to: "/timeline" });
  };

  const handleAuthoritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      toast.error("Please enter an authority passcode");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.authorityLogin(passcode);
      if ("error" in result) {
        toast.error(result.error || "Authentication failed");
      } else {
        // Assume result.user matches the expected User signature
        mockAuth.login(result.user as User);
        toast.success("Welcome back, Admin");
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error("Network error connecting to auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="w-full max-w-md premium-shadow">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Select a role to login</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={handleCitizenLogin}>
              Login as Citizen (Demo)
            </Button>
            
            {!showAuthorityInput ? (
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => setShowAuthorityInput(true)}
              >
                <LockKeyhole className="w-4 h-4 mr-2" />
                Login as Authority
              </Button>
            ) : (
              <form onSubmit={handleAuthoritySubmit} className="space-y-3 p-4 bg-muted/30 rounded-lg border animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Authority Passcode
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      placeholder="Enter passcode..." 
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      autoFocus
                      className="bg-background"
                    />
                    <Button type="submit" disabled={isLoading} className="px-3">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-[10px] text-center text-muted-foreground">
                  Hint: Try <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">ADMIN123</span>
                </div>
              </form>
            )}

            <div className="pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
