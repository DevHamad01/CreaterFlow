import { useEffect, useState, useRef } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { scanAllCampaignAlerts, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";
import { Bell, Check, CheckCheck, AlertTriangle, Target, Wallet, Info, TrendingUp } from "lucide-react";

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-100" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  success: { icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
};

const TYPE_ICONS = {
  budget_80: Wallet,
  budget_100: Wallet,
  lead_goal_reached: Target,
  lead_goal_50: TrendingUp,
  campaign_status: Info,
  draft_submitted: Info,
  payment_due: Wallet,
  info: Info,
};

export default function NotificationCenter({ user, campaigns }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const dropdownRef = useRef(null);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const notifs = await base44.entities.Notification.list("-created_date", 30);
      setNotifications(notifs);
    } catch {
      setNotifications([]);
    }
  };

  // Scan for new alerts when campaigns are available
  useEffect(() => {
    if (!user || !campaigns || campaigns.length === 0) return;
    let cancelled = false;
    (async () => {
      setScanning(true);
      try {
        const [payments, leads] = await Promise.all([
          base44.entities.Payment.list("-created_date", 100),
          base44.entities.Lead.list("-created_date", 100),
        ]);
        await scanAllCampaignAlerts(campaigns, payments, leads);
        if (!cancelled) await loadNotifications();
      } catch {
        // silent
      } finally {
        if (!cancelled) setScanning(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, campaigns]);

  // Also load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) handleMarkRead(notif.id);
    if (notif.action_url) {
      window.location.href = notif.action_url;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Campaign alerts will appear here automatically</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type] || Info;
                const config = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? "bg-blue-50/30" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      {notif.campaign_name && (
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{notif.campaign_name}</p>
                      )}
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {scanning && (
            <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
              Scanning campaigns for alerts…
            </div>
          )}
        </div>
      )}
    </div>
  );
}