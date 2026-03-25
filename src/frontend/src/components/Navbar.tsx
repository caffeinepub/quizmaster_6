import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Brain, List, LogOut, Plus, Rss, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Quizzes", icon: List },
    { path: "/feed", label: "Feed", icon: Rss },
    { path: "/create", label: "Create Quiz", icon: Plus },
    { path: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "oklch(0.10 0.022 250 / 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid oklch(0.28 0.04 245 / 0.4)",
      }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          data-ocid="nav.link"
        >
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow-cyan">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">QuizMaster</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? "gradient-bg text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              data-ocid="nav.link"
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="ml-auto flex items-center gap-3">
          {identity ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="gradient-bg text-white text-xs">
                    {profile?.username?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {profile?.username ?? "User"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="nav.link"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Log Out
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="gradient-bg border-0 text-white font-semibold rounded-full px-5 glow-cyan"
              data-ocid="nav.primary_button"
            >
              {loginStatus === "logging-in" ? "Connecting..." : "Log In"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
