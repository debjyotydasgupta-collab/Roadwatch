import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Map,
  LayoutDashboard,
  Search,
  Coins,
  Globe,
  Menu,
  X,
  MessageCircle,
  Flag,
  Wallet,
} from "lucide-react";
import { useAuth, mockAuth } from "@/hooks/use-auth";
import { useRegion } from "@/hooks/use-region";
import { LanguageSelector } from "@/components/LanguageSelector";
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

  const PublicLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link to="/map" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <Map className="w-4 h-4 mr-2" /> Map
        </Button>
      </Link>
      <Link to="/report" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <Flag className="w-4 h-4 mr-2" /> Report
        </Button>
      </Link>
      <Link to="/chat" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <MessageCircle className="w-4 h-4 mr-2" /> AI Chat
        </Button>
      </Link>
      <Link to="/spending" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <Wallet className="w-4 h-4 mr-2" /> Spending
        </Button>
      </Link>
      <Link to="/calculator" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <Search className="w-4 h-4 mr-2" /> Traffic Laws
        </Button>
      </Link>
      <Link to="/analytics" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          Analytics
        </Button>
      </Link>
      <Link to="/budget" onClick={onNavigate}>
        <Button variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          Budget
        </Button>
      </Link>
    </>
  );

  const closeMobile = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">RoadWatch</span>
        </Link>

        <div className="hidden lg:flex items-center space-x-1">
          <PublicLinks />
          {user?.role === "citizen" && (
            <Link to="/timeline">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Timeline
              </Button>
            </Link>
          )}
          {user?.role === "authority" && (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user?.role === "citizen" && (
            <div className="hidden sm:flex items-center text-sm font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
              <Coins className="w-4 h-4 mr-1" />
              {user.points} pts
            </div>
          )}

          <LanguageSelector />

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
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:flex">
              <Button variant="default" size="sm">
                Login
              </Button>
            </Link>
          )}

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t p-4 flex flex-col gap-2 bg-background max-h-[70vh] overflow-y-auto">
          <PublicLinks onNavigate={closeMobile} />
          {user?.role === "citizen" && (
            <Link to="/timeline" onClick={closeMobile}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Timeline
              </Button>
            </Link>
          )}
          {user?.role === "authority" && (
            <>
              <Link to="/admin" onClick={closeMobile}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Admin
                </Button>
              </Link>
              <Link to="/dashboard" onClick={closeMobile}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
            </>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full mt-2">
              Logout
            </Button>
          ) : (
            <Link to="/login" onClick={closeMobile}>
              <Button variant="default" size="sm" className="w-full mt-2">
                Login
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
