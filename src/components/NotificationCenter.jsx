import { useCallback, useEffect, useId, useRef, useState } from "react";
import { scanAllCampaignAlerts, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";
import { preferLive } from "@/lib/seeded";
import { notifications as seedNotifications } from "@/data/app";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, CheckCheck, AlertTriangle, Target, Wallet, Info, TrendingUp, Loader2, RefreshCw
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  success: { icon: Target, color: "text-success", bg: "bg-success/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

// Keys must match TYPE_ICONS below or every seeded row falls back to the
// generic Info glyph and the bell looks uniform.
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
  // Seeded so the bell has content on a fresh account instead of the
  // "No notifications yet" empty state. A live response replaces them.
  const [notifications, setNotifications] = useState(seedNotifications);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  // Load notifications
  const loadNotifications = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setLoadError(false);
    try {
      const notifs = await base44.entities.Notification.list("-created_date", 30);
      setNotifications(preferLive(seedNotifications)(notifs));
    } catch (err) {
      console.error("NotificationCenter: load failed", err);
      // Keep the seeded rows visible: a fetch failure is not a reason to empty
      // a panel that has sample content to show.
      setNotifications(seedNotifications);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

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
        if (!cancelled) await loadNotifications({ quiet: true });
      } catch (err) {
        // Alerts are best-effort; the list below still shows what already exists.
        console.error("NotificationCenter: scan failed", err);
      } finally {
        if (!cancelled) setScanning(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, campaigns, loadNotifications]);

  // Also load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close on outside click or Escape, returning focus to the trigger
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("NotificationCenter: mark read failed", err);
    }
  };

  const handleMarkAllRead = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead(user?.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("NotificationCenter: mark all read failed", err);
      loadNotifications({ quiet: true });
    } finally {
      setBusy(false);
    }
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
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
            <span className="sr-only"> unread notifications</span>
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 flex max-h-[70vh] w-80 flex-col rounded-2xl border border-border bg-card shadow-overlay sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={busy}
                className="h-auto p-0 text-xs"
              >
                {busy ? (
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4" aria-busy="true" aria-live="polite">
                <span className="sr-only">Loading notifications</span>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-9 w-9 flex-shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {loadError && (
                  <p
                    role="status"
                    className="flex items-start gap-2 border-b border-border/70 bg-warning/10 px-4 py-2.5 text-xs text-warning"
                  >
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      Showing sample alerts. We couldn&apos;t reach your notifications.
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => loadNotifications()}
                      className="ml-auto h-auto shrink-0 p-0 text-xs"
                    >
                      <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </p>
                )}
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                    <span
                      aria-hidden="true"
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
                    >
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <p className="text-sm font-medium">No notifications yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Campaign alerts will appear here automatically
                    </p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((notif) => {
                      const Icon = TYPE_ICONS[notif.type] || Info;
                      const config = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info;
                      return (
                        <li key={notif.id}>
                          <button
                            type="button"
                            onClick={() => handleNotifClick(notif)}
                            className={`flex w-full items-start gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-muted ${
                              !notif.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                            >
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">
                                {notif.title}
                                {!notif.read && <span className="sr-only"> (unread)</span>}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                                {notif.message}
                              </span>
                              {notif.campaign_name && (
                                <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  {notif.campaign_name}
                                </span>
                              )}
                            </span>
                            {!notif.read && (
                              <span aria-hidden="true" className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>

          {scanning && (
            <p className="flex items-center gap-2 border-t border-border/70 px-4 py-2 text-xs text-muted-foreground">
              <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin" />
              Scanning campaigns for alerts…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
