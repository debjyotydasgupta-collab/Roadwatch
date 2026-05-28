import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Map, LayoutDashboard, Search, Coins, Globe, Menu, X } from "lucide-react";
import { useAuth, mockAuth } from "@/hooks/use-auth";
import { useRegion } from "@/hooks/use-region";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { region, setRegion } = useRegion();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    mockAuth.logout();
    navigate({ to: "/" });
  };

  // These are public features that anyone can view
  const PublicLinks = () => (
    <>
      <Link to="/map" onClick={() => setOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto"><Map className="w-4 h-4 mr-2"/> Map</Button>
      </Link>
      <Link to="/calculator" onClick={() => setOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto"><Search className="w-4 h-4 mr-2"/> Traffic Laws</Button>
      </Link>
      <Link to="/analytics" onClick={() => setOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">Analytics</Button>
      </Link>
      <Link to="/budget" onClick={() => setOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">Budget</Button>
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">RoadWatch</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center space-x-1">
          <PublicLinks />
          
          {user?.role === "citizen" && (
            <Link to="/timeline">
              <Button variant="ghost" size="sm"><LayoutDashboard className="w-4 h-4 mr-2"/> Timeline</Button>
            </Link>
          )}
          {user?.role === "authority" && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">Admin Dashboard</Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user?.role === "citizen" && (
            <div className="hidden sm:flex items-center text-sm font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
              <Coins className="w-4 h-4 mr-1" />
              {user.points} pts
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Globe className="w-4 h-4 mr-1" />
                {region}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRegion("IN")}>India (₹)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRegion("US")}>Global ($)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline-block">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">Logout</Button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:flex">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="sm:hidden p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="sm:hidden border-t p-4 flex flex-col gap-2 bg-background">
          <PublicLinks />
          {user?.role === "citizen" && (
            <Link to="/timeline" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start"><LayoutDashboard className="w-4 h-4 mr-2"/> Timeline</Button>
            </Link>
          )}
          {user?.role === "authority" && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">Admin Dashboard</Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full mt-2">Logout</Button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="default" size="sm" className="w-full mt-2">Login</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
