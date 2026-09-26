import { db, base44 } from "@/api/base44Client";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";

/**
 * Checks a campaign against its goals and creates alert notifications if thresholds are hit.
 * Deduplicates by checking for existing unread notifications of the same type + campaign.
 */
export async function checkCampaignAlerts(campaign, payments, leads, campaignCreators) {
  if (!campaign || !campaign.id) return [];

  const notifications = [];
  const totalSpend = payments
    .filter((p) => p.campaign_id === campaign.id && p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const totalLeads = leads.filter((l) => l.campaign_id === campaign.id).length;
  const budget = campaign.budget || 0;
  const leadTarget = campaign.lead_target || 0;

  // Check for existing unread notifications to avoid duplicates
  let existing = [];
  try {
    const notifRef = collection(db, "notifications");
    const q = query(
      notifRef,
      where("campaign_id", "==", campaign.id),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);
    existing = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }

  const hasNotif = (type) => existing.some((n) => n.type === type);

  // Budget alerts
  if (budget > 0) {
    const pct = (totalSpend / budget) * 100;
    if (pct >= 100 && !hasNotif("budget_100")) {
      notifications.push({
        type: "budget_100",
        title: "Budget fully spent",
        message: `"${campaign.name}" has used 100% of its €${budget.toLocaleString()} budget.`,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        severity: "critical",
        action_url: `/app/campaigns/${campaign.id}`,
        read: false,
        created_at: Timestamp.now(),
      });
    } else if (pct >= 80 && pct < 100 && !hasNotif("budget_80")) {
      notifications.push({
        type: "budget_80",
        title: "Budget 80% spent",
        message: `"${campaign.name}" has used ${pct.toFixed(0)}% of its €${budget.toLocaleString()} budget.`,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        severity: "warning",
        action_url: `/app/campaigns/${campaign.id}`,
        read: false,
        created_at: Timestamp.now(),
      });
    }
  }

  // Lead goal alerts
  if (leadTarget > 0) {
    if (totalLeads >= leadTarget && !hasNotif("lead_goal_reached")) {
      notifications.push({
        type: "lead_goal_reached",
        title: "Lead goal reached! 🎯",
        message: `"${campaign.name}" hit its lead target of ${leadTarget} leads.`,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        severity: "success",
        action_url: `/app/campaigns/${campaign.id}`,
        read: false,
        created_at: Timestamp.now(),
      });
    } else if (totalLeads >= leadTarget * 0.5 && totalLeads < leadTarget && !hasNotif("lead_goal_50")) {
      notifications.push({
        type: "lead_goal_50",
        title: "Halfway to lead goal",
        message: `"${campaign.name}" is at ${totalLeads}/${leadTarget} leads — 50% of target reached.`,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        severity: "info",
        action_url: `/app/campaigns/${campaign.id}`,
        read: false,
        created_at: Timestamp.now(),
      });
    }
  }

  // Create new notifications
  for (const n of notifications) {
    try {
      await base44.entities.Notification.create(n);
    } catch {
      // silent — notifications are best-effort
    }
  }

  return notifications;
}

/**
 * Scans all campaigns for a user and fires alert checks.
 */
export async function scanAllCampaignAlerts(campaigns, allPayments, allLeads) {
  const results = [];
  for (const camp of campaigns) {
    if (["draft", "cancelled"].includes(camp.status)) continue;
    const campPayments = allPayments.filter((p) => p.campaign_id === camp.id);
    const campLeads = allLeads.filter((l) => l.campaign_id === camp.id);
    const newNotifs = await checkCampaignAlerts(camp, campPayments, campLeads, []);
    results.push(...newNotifs);
  }
  return results;
}

/**
 * Marks a notification as read.
 */
export async function markNotificationRead(id) {
  try {
    await base44.entities.Notification.update(id, { read: true });
  } catch {
    // silent
  }
}

/**
 * Marks all unread notifications as read.
 */
export async function markAllNotificationsRead(userId) {
  try {
    const unread = await base44.entities.Notification.filter({ read: false });
    if (unread.length === 0) return;
    await base44.entities.Notification.updateMany(
      { id: { $in: unread.map((n) => n.id) } },
      { $set: { read: true } }
    );
  } catch {
    // silent
  }
}