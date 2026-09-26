import { Link, useLocation, Outlet } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";
import { Logo } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Search, FolderKanban, Heart, BarChart3,
  CreditCard, Settings, LogOut, Menu, Briefcase, Wallet, UserCircle, Megaphone, X
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const COMPANY_NAV = [
  { label: "Dashboard", path: "/app", icon: LayoutDashboard },
  { label: "Marketplace", path: "/app/marketplace", icon: Search },
  { label: "Campaigns", path: "/app/campaigns", icon: FolderKanban },
  { label: "Saved creators", path: "/app/saved", icon: Heart },
  { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
  { label: "Payments", path: "/app/payments", icon: CreditCard },
  { label: "Settings", path: "/app/settings", icon: Settings },
];

const CREATOR_NAV = [
  { label: "Dashboard", path: "/app", icon: LayoutDashboard },
  { label: "Opportunities", path: "/app/opportunities", icon: Megaphone },
  { label: "My campaigns", path: "/app/my-campaigns", icon: Briefcase },
  { label: "Earnings", path: "/app/earnings", icon: Wallet },
  { label: "My profile", path: "/app/profile", icon: UserCircle },
  { label: "Settings", path: "/app/settings", icon: Settings },
];

/**
 * Hoisted out of AppSidebar so it is not re-created (and re-mounted) on every
 * parent render â€” that was resetting NotificationCenter's internal state.
 */
function SidebarContent({ user, isCreator, campaigns, pathname, onNavigate, onSignOut }) {
  const nav = isCreator ? CREATOR_NAV : COMPANY_NAV;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link to="/" onClick={onNavigate} className="rounded-lg" aria-label="8xNanoo home">
          <Logo />
        </Link>
        {!isCreator && <NotificationCenter user={user} campaigns={campaigns} />}
      </div>

      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || user?.email}&backgroundColor=6d3bf5`}
            alt=""
            className="h-9 w-9 flex-shrink-0 rounded-full bg-muted object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {isCreator ? "Creator" : "Company"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {nav.map((item) => {
          const active =
            pathname === item.path ||
            (item.path !== "/app" && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color] duration-200 ease-smooth ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200 ease-smooth ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                }`}
              />
              <item.icon aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const isCreator = user?.user_type === "creator";

  useEffect(() => {
    if (user && !isCreator) {
      base44.entities.Campaign.filter({ created_by_id: user.id })
        .then(setCampaigns)
        .catch(() => {});
    }
  }, [user, isCreator]);

  // Close the drawer on navigation and on Escape
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = useCallback(async () => {
    await logout();
    window.location.href = "/login";
  }, [logout]);

  const content = (
    <SidebarContent
      user={user}
      isCreator={isCreator}
      campaigns={campaigns}
      pathname={location.pathname}
      onNavigate={() => setMobileOpen(false)}
      onSignOut={handleSignOut}
    />
  );

  return (
    <div className="min-h-screen bg-muted">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-scrim/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="app-drawer"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border shadow-overlay lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3.5 z-10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </Button>
            {content}
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-col lg:ml-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/85 px-3 backdrop-blur-xl lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-controls="app-drawer"
            aria-expanded={mobileOpen}
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
          <Link to="/app" aria-label="8xNanoo dashboard">
            <Logo compact />
          </Link>
          <div className="w-10">{!isCreator && <NotificationCenter user={user} campaigns={campaigns} />}</div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
