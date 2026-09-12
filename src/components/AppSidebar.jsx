import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { firestoreService } from "@/lib/firestore-service";
import NotificationCenter from "@/components/NotificationCenter";
import {
  LayoutDashboard, Search, FolderKanban, Heart, BarChart3,
  CreditCard, Settings, LogOut, Menu, X, Sparkles, Briefcase,
  PenSquare, Wallet, UserCircle, Megaphone
} from "lucide-react";

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const isCreator = user?.user_type === "creator";

  useEffect(() => {
    if (user && !isCreator) {
      base44.entities.Campaign.filter({ created_by_id: user.id }).then(setCampaigns).catch(() => {});
    }
  }, [user, isCreator]);

  const companyNav = [
    { label: "Dashboard", path: "/app", icon: LayoutDashboard },
    { label: "Marketplace", path: "/app/marketplace", icon: Search },
    { label: "Campaigns", path: "/app/campaigns", icon: FolderKanban },
    { label: "Saved creators", path: "/app/saved", icon: Heart },
    { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
    { label: "Payments", path: "/app/payments", icon: CreditCard },
    { label: "Settings", path: "/app/settings", icon: Settings },
  ];

  const creatorNav = [
    { label: "Dashboard", path: "/app", icon: LayoutDashboard },
    { label: "Opportunities", path: "/app/opportunities", icon: Megaphone },
    { label: "My campaigns", path: "/app/my-campaigns", icon: Briefcase },
    { label: "Earnings", path: "/app/earnings", icon: Wallet },
    { label: "My profile", path: "/app/profile", icon: UserCircle },
    { label: "Settings", path: "/app/settings", icon: Settings },
  ];

  const nav = isCreator ? creatorNav : companyNav;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg text-slate-900">CreatorFlow</span>
        </Link>
        {!isCreator && <NotificationCenter user={user} campaigns={campaigns} />}
      </div>

      <div className="px-3 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || user?.email}&backgroundColor=2563eb`}
            alt=""
            className="w-9 h-9 rounded-full bg-slate-100"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-slate-500 capitalize">{isCreator ? "Creator" : "Company"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/app" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-14 bg-white border-b border-slate-200 px-4 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-semibold text-slate-900">CreatorFlow</span>
          </Link>
          {!isCreator && <NotificationCenter user={user} campaigns={campaigns} />}
        </div>

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}