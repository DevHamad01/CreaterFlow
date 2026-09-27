// Sample records for the signed-in company and creator workspaces.
//
// The marketing pages seed from src/data/creators.js. Nothing seeded the
// product itself, so with the backend unavailable every dashboard, list and
// report read as empty -- the app looked broken rather than unpopulated.
//
// Field names match the Base44 entities in base44/entities exactly, so these
// rows flow through the same components, selectors and aggregations as live
// records. Every id below is referenced by the rows around it, so cross-entity
// joins (campaign -> creator -> post -> metric -> lead -> payment) resolve the
// same way they do in production.
//
// All data here is fictional sample data. Names, companies, people and numbers
// are invented. Nothing here refers to a real person, brand or transaction.
//
// Delete this file once the backend is populated and the pages keep working:
// each page only replaces the seed when the live response is non-empty.

import { creators } from "./creators";

const COMPANY = "Northbeam Analytics";
const CREATOR_IDS = creators.map((c) => c.id);
const creatorById = Object.fromEntries(creators.map((c) => [c.id, c]));

// campaignCreators and favorites both denormalise three fields off the creator
// record. They used to be hand-typed literals, which drifted out of sync the
// moment the sample niches were renamed to match the Creator entity enum — the
// CRM then showed a niche that no longer existed on the marketplace. Deriving
// them from the creator record makes drift impossible.
const withCreatorFields = (rows) =>
  rows.map((row) => {
    const source = row.creator_id && creatorById[row.creator_id];
    if (!source) return row;
    return {
      ...row,
      creator_niche: source.niche,
      creator_headline: source.headline,
      creator_followers: source.linkedin_followers,
    };
  });

const day = (n) => new Date(Date.UTC(2026, 8, 1 + n)).toISOString();

// ── Campaigns ───────────────────────────────────────────────────────────────
export const campaigns = [
  {
    id: "camp-flowpilot",
    name: "FlowPilot Launch",
    company_id: "northbeam",
    company_name: COMPANY,
    objective: "Lead generation",
    target_audience: "Engineering managers at B2B SaaS companies with 50-500 staff",
    budget: 12000,
    key_messages: [
      "Replace status meetings with automated delivery reporting",
      "See blocked work before it slips a sprint",
    ],
    creator_guidelines:
      "No competitor disparagement, no fake urgency. Every claim must trace to a shipped feature. Disclose that the post is a paid partnership.",
    content_direction: "Practical workflow advice grounded in the creator's own delivery experience",
    status: "active",
    product: "FlowPilot",
    desired_outcome: "150 qualified demos",
    start_date: day(0),
    end_date: day(45),
    lead_target: 150,
    tracking_base_url: "https://creatorflow.app/t/flowpilot",
    created_by_id: "seed-company",
    created_date: day(0),
  },
  {
    id: "camp-peopleops",
    name: "People Ops Reboot",
    company_id: "northbeam",
    company_name: COMPANY,
    objective: "Brand awareness",
    target_audience: "HR and people-operations leaders at 200-2000 person companies",
    budget: 8500,
    key_messages: [
      "Onboarding time is a retention problem, not an HR problem",
      "Measure the first 30 days, not the first week",
    ],
    creator_guidelines:
      "Keep it experience-led. No statistics unless the creator can cite the source. Paid partnership must be disclosed.",
    content_direction: "First-person accounts of running onboarding at scale",
    status: "active",
    product: "Northbeam People",
    desired_outcome: "40 qualified conversations",
    start_date: day(8),
    end_date: day(52),
    lead_target: 40,
    tracking_base_url: "https://creatorflow.app/t/peopleops",
    created_by_id: "seed-company",
    created_date: day(8),
  },
  {
    id: "camp-fintrust",
    name: "Fintech Trust Series",
    company_id: "northbeam",
    company_name: COMPANY,
    objective: "Thought leadership",
    target_audience: "Finance and risk leaders evaluating embedded payments",
    budget: 15000,
    key_messages: [
      "Explain reconciliation failures the way an auditor would",
      "Latency is a compliance surface, not just a UX one",
    ],
    creator_guidelines:
      "Regulated topic: no advice on specific instruments, no returns claims. Reference published standards only.",
    content_direction: "Technical explainers on payment infrastructure",
    status: "completed",
    product: "Northbeam Ledger",
    desired_outcome: "25 enterprise conversations",
    start_date: day(-70),
    end_date: day(-25),
    lead_target: 25,
    tracking_base_url: "https://creatorflow.app/t/fintrust",
    created_by_id: "seed-company",
    created_date: day(-70),
  },
  {
    id: "camp-devweekly",
    name: "DevTools Weekly",
    company_id: "northbeam",
    company_name: COMPANY,
    objective: "Content amplification",
    target_audience: "Senior backend and platform engineers",
    budget: 5000,
    key_messages: [
      "Ship smaller batches, measure rework, argue from your own numbers",
    ],
    creator_guidelines: "Engineering-audience only. No product screenshots.",
    content_direction: "Weekly engineering practice notes",
    status: "draft",
    product: "FlowPilot",
    desired_outcome: "60 signups",
    start_date: day(20),
    end_date: day(75),
    lead_target: 60,
    tracking_base_url: "https://creatorflow.app/t/devweekly",
    created_by_id: "seed-company",
    created_date: day(16),
  },
];

// ── Campaign creators ───────────────────────────────────────────────────────
// status follows the CampaignCreator enum: invited | accepted |
// draft_submitted | in_review | revision_requested | approved | scheduled |
// live | completed
export const campaignCreators = withCreatorFields([
  {
    id: "cc-1",
    campaign_id: "camp-flowpilot",
    creator_id: "marcus-bell",
    creator_name: "Marcus Bell",
    creator_niche: "DevTools",
    creator_followers: 27000,
    fit_score: 94,
    price: 400,
    status: "live",
    tracking_link: "https://creatorflow.app/t/flowpilot/marcus-bell",
    invited_date: day(2),
    accepted_date: day(4),
  },
  {
    id: "cc-2",
    campaign_id: "camp-flowpilot",
    creator_id: "daniel-roth",
    creator_name: "Daniel Roth",
    creator_niche: "Sales & GTM",
    creator_followers: 32000,
    fit_score: 88,
    price: 480,
    status: "live",
    tracking_link: "https://creatorflow.app/t/flowpilot/daniel-roth",
    invited_date: day(2),
    accepted_date: day(5),
  },
  {
    id: "cc-3",
    campaign_id: "camp-flowpilot",
    creator_id: "aiko-tanaka",
    creator_name: "Aiko Tanaka",
    creator_niche: "Marketing analytics",
    creator_followers: 61000,
    fit_score: 81,
    price: 900,
    status: "approved",
    tracking_link: "https://creatorflow.app/t/flowpilot/aiko-tanaka",
    invited_date: day(3),
    accepted_date: day(6),
  },
  {
    id: "cc-4",
    campaign_id: "camp-flowpilot",
    creator_id: "sofia-marin",
    creator_name: "Sofia Marin",
    creator_niche: "SEO & SaaS",
    creator_followers: 48000,
    fit_score: 76,
    price: 650,
    status: "in_review",
    tracking_link: "https://creatorflow.app/t/flowpilot/sofia-marin",
    invited_date: day(3),
  },
  {
    id: "cc-5",
    campaign_id: "camp-peopleops",
    creator_id: "elena-petrova",
    creator_name: "Elena Petrova",
    creator_niche: "HR Tech",
    creator_followers: 19000,
    fit_score: 97,
    price: 320,
    status: "live",
    tracking_link: "https://creatorflow.app/t/peopleops/elena-petrova",
    invited_date: day(9),
    accepted_date: day(10),
  },
  {
    id: "cc-6",
    campaign_id: "camp-peopleops",
    creator_id: "sofia-marin",
    creator_name: "Sofia Marin",
    creator_niche: "SEO & SaaS",
    creator_followers: 48000,
    fit_score: 72,
    price: 650,
    status: "draft_submitted",
    tracking_link: "https://creatorflow.app/t/peopleops/sofia-marin",
    invited_date: day(10),
    accepted_date: day(12),
  },
  {
    id: "cc-7",
    campaign_id: "camp-fintrust",
    creator_id: "tom-eriksen",
    creator_name: "Tom Eriksen",
    creator_niche: "FinTech",
    creator_followers: 54000,
    fit_score: 95,
    price: 750,
    status: "completed",
    tracking_link: "https://creatorflow.app/t/fintrust/tom-eriksen",
    invited_date: day(-68),
    accepted_date: day(-66),
  },
  {
    id: "cc-8",
    campaign_id: "camp-fintrust",
    creator_id: "aiko-tanaka",
    creator_name: "Aiko Tanaka",
    creator_niche: "Marketing analytics",
    creator_followers: 61000,
    fit_score: 84,
    price: 900,
    status: "completed",
    tracking_link: "https://creatorflow.app/t/fintrust/aiko-tanaka",
    invited_date: day(-67),
    accepted_date: day(-64),
  },
  {
    id: "cc-9",
    campaign_id: "camp-devweekly",
    creator_id: "marcus-bell",
    creator_name: "Marcus Bell",
    creator_niche: "DevTools",
    creator_followers: 27000,
    fit_score: 92,
    price: 400,
    status: "invited",
    tracking_link: "https://creatorflow.app/t/devweekly/marcus-bell",
    invited_date: day(17),
  },
]);

// ── Posts ───────────────────────────────────────────────────────────────────
export const posts = [
  {
    id: "post-1",
    campaign_id: "camp-flowpilot",
    campaign_creator_id: "cc-1",
    creator_id: "marcus-bell",
    creator_name: "Marcus Bell",
    content:
      "We killed our Monday status meeting in March. Not shortened it, killed it. The replacement is a report the team writes once, automatically, from the tracker. Three months in: 6 hours a week returned per engineer, and we caught 4 slipped dependencies a sprint earlier than we used to. Paid partnership with FlowPilot.",
    status: "live",
    post_url: "https://www.linkedin.com/posts/marcusbell-status-meeting",
    scheduled_date: day(12),
    published_date: day(12),
    revision_count: 1,
  },
  {
    id: "post-2",
    campaign_id: "camp-flowpilot",
    campaign_creator_id: "cc-2",
    creator_id: "daniel-roth",
    creator_name: "Daniel Roth",
    content:
      "Your CRM is not your pipeline. I have audited 40 SaaS launches and the pattern is identical: reps update the CRM after the deal is already forecast, so the forecast is fiction. If you want attribution that survives a board meeting, capture it at the moment of intent, not the moment of signature. Paid partnership with FlowPilot.",
    status: "live",
    post_url: "https://www.linkedin.com/posts/danielroth-crm-pipeline",
    scheduled_date: day(15),
    published_date: day(15),
    revision_count: 0,
  },
  {
    id: "post-3",
    campaign_id: "camp-flowpilot",
    campaign_creator_id: "cc-3",
    creator_id: "aiko-tanaka",
    creator_name: "Aiko Tanaka",
    content:
      "Attribution is a measurement problem before it is a tooling problem. Before you buy anything, write down the decision each touchpoint is supposed to influence. If you cannot name it, the touchpoint is decoration. Paid partnership with FlowPilot.",
    status: "approved",
    post_url: "",
    scheduled_date: day(22),
    revision_count: 2,
  },
  {
    id: "post-4",
    campaign_id: "camp-flowpilot",
    campaign_creator_id: "cc-4",
    creator_id: "sofia-marin",
    creator_name: "Sofia Marin",
    content:
      "Draft: measuring engineering velocity is easy, measuring whether it improved is the hard part. Working through a framework for attributing delivery improvements to process changes rather than to a quiet quarter. Paid partnership with FlowPilot.",
    status: "in_review",
    post_url: "",
    revision_count: 0,
  },
  {
    id: "post-5",
    campaign_id: "camp-peopleops",
    campaign_creator_id: "cc-5",
    creator_id: "elena-petrova",
    creator_name: "Elena Petrova",
    content:
      "We measured onboarding for a quarter before changing anything. 71% of new hires had not finished the checklist by day 14. Nobody was lazy; the checklist assumed a manager who was in meetings all week. We moved ownership to the new hire and the median time-to-productive dropped by 9 days. Paid partnership with Northbeam People.",
    status: "live",
    post_url: "https://www.linkedin.com/posts/elenapetrova-onboarding-measurement",
    scheduled_date: day(18),
    published_date: day(18),
    revision_count: 1,
  },
  {
    id: "post-6",
    campaign_id: "camp-peopleops",
    campaign_creator_id: "cc-6",
    creator_id: "sofia-marin",
    creator_name: "Sofia Marin",
    content:
      "Draft: the first 30 days are a retention question wearing an onboarding hat. I am collecting patterns from four companies that measure the whole first month instead of the first week. Paid partnership with Northbeam People.",
    status: "draft_submitted",
    post_url: "",
    revision_count: 0,
  },
  {
    id: "post-7",
    campaign_id: "camp-fintrust",
    campaign_creator_id: "cc-7",
    creator_id: "tom-eriksen",
    creator_name: "Tom Eriksen",
    content:
      "Reconciliation failures are almost never a database problem. They are an ordering problem: two ledgers that disagree about what happened first. If your settlement runs before your ledger settles, you will find the gap in a reconciliation report instead of in an incident review. Paid partnership with Northbeam Ledger.",
    status: "live",
    post_url: "https://www.linkedin.com/posts/tomeriksen-reconciliation",
    scheduled_date: day(-58),
    published_date: day(-58),
    revision_count: 1,
  },
  {
    id: "post-8",
    campaign_id: "camp-fintrust",
    campaign_creator_id: "cc-8",
    creator_id: "aiko-tanaka",
    creator_name: "Aiko Tanaka",
    content:
      "Payment latency is a compliance surface. An auditor does not care that checkout felt slow; they care that the event order in your records is reconstructable. Paid partnership with Northbeam Ledger.",
    status: "live",
    post_url: "https://www.linkedin.com/posts/aikotanaka-payment-latency",
    scheduled_date: day(-48),
    published_date: day(-48),
    revision_count: 0,
  },
];

// ── Metrics ─────────────────────────────────────────────────────────────────
// One row per creator per campaign per measured day, mirroring how CampaignMetric
// is written in production. Base volume is scaled off each creator's follower
// count so the analytics pages show a believable spread rather than flat lines.
const METRIC_DAYS = 6;

export const metrics = campaignCreators
  .filter((cc) => ["live", "completed"].includes(cc.status))
  .flatMap((cc) => {
    const creator = creatorById[cc.creator_id];
    const reach = Math.round((creator?.linkedin_followers || 20000) * 0.42);
    const completed = cc.status === "completed";
    const days = completed ? METRIC_DAYS : 3;

    return Array.from({ length: days }, (_, i) => {
      // Decay: a post performs best on day one and settles down.
      const decay = 1 - i * 0.18;
      const impressions = Math.round(reach * decay);
      const clicks = Math.round(impressions * 0.021);
      return {
        id: `m-${cc.id}-${i}`,
        campaign_id: cc.campaign_id,
        creator_id: cc.creator_id,
        post_id: posts.find((p) => p.campaign_creator_id === cc.id)?.id || "",
        impressions,
        clicks,
        qualified_clicks: Math.round(clicks * 0.31),
        leads: Math.max(0, Math.round(clicks * 0.028)),
        pipeline_value: Math.round(clicks * 0.028 * 4200),
        date: day(completed ? -62 + i * 6 : 13 + i * 3),
      };
    });
  });

// ── Leads ───────────────────────────────────────────────────────────────────
const LEAD_PEOPLE = [
  ["Ines Kowalczyk", "Director of Engineering", "ines.kowalczyk@example.invalid"],
  ["Tomás Ferreira", "VP Product", "tomas.ferreira@example.invalid"],
  ["Nadia Haddad", "Head of Delivery", "nadia.haddad@example.invalid"],
  ["Jonas Berg", "Staff Engineer", "jonas.berg@example.invalid"],
  ["Priya Raghavan", "Engineering Manager", "priya.raghavan@example.invalid"],
  ["Lukas Weiss", "CTO", "lukas.weiss@example.invalid"],
  ["Amara Okafor", "Director of People", "amara.okafor@example.invalid"],
  ["Felix Braun", "RevOps Lead", "felix.braun@example.invalid"],
  ["Hana Kimura", "Finance Director", "hana.kimura@example.invalid"],
  ["Oliver Nyberg", "Head of Risk", "oliver.nyberg@example.invalid"],
  ["Rania Haddad", "Product Lead", "rania.haddad@example.invalid"],
  ["Marek Dvorak", "Platform Lead", "marek.dvorak@example.invalid"],
];

// Leads only exist for work that was actually live or finished, so the pool is
// derived from the data rather than assumed. A hardcoded modulus silently
// produced undefined rows as soon as the set size changed.
const leadSources = campaignCreators.filter((c) => ["live", "completed"].includes(c.status));

export const leads = Array.from({ length: 26 }, (_, i) => {
  const cc = leadSources[i % leadSources.length];
  const [contact_name, title, email] = LEAD_PEOPLE[i % LEAD_PEOPLE.length];
  const campaign = campaigns.find((c) => c.id === cc.campaign_id);
  return {
    id: `lead-${i + 1}`,
    campaign_id: cc.campaign_id,
    creator_id: cc.creator_id,
    creator_name: cc.creator_name,
    post_id: posts.find((p) => p.campaign_creator_id === cc.id)?.id || "",
    company_name: campaign?.company_name || COMPANY,
    contact_name,
    email,
    title,
    value: 3200 + ((i * 1450) % 19000),
    status: ["new", "contacted", "qualified", "won", "lost"][i % 5],
    source: "tracked_link",
    date: day(14 + (i % 20)),
    created_by_id: "seed-company",
  };
});

// ── Payments ────────────────────────────────────────────────────────────────
export const payments = campaignCreators.map((cc, i) => {
  const campaign = campaigns.find((c) => c.id === cc.campaign_id);
  // Live work is unpaid; completed work is paid; everything else is pending.
  const status = cc.status === "completed" ? "paid" : cc.status === "live" ? "pending" : "draft";
  return {
    id: `pay-${i + 1}`,
    campaign_id: cc.campaign_id,
    campaign_name: campaign?.name || "",
    creator_id: cc.creator_id,
    creator_name: cc.creator_name,
    company_name: COMPANY,
    amount: cc.price,
    status,
    due_date: day(20 + i * 3),
    paid_date: status === "paid" ? day(-30) : null,
    invoice_number: `NB-${2026}-${String(1041 + i)}`,
    type: "post",
    created_by_id: "seed-company",
  };
});

// ── Templates ───────────────────────────────────────────────────────────────
export const campaignTemplates = [
  {
    id: "tpl-launch",
    name: "Product launch playbook",
    description: "Standard two-phase launch for a mid-market SaaS release.",
    objective: "Product launch",
    target_audience: "Department heads at 50-500 person B2B SaaS companies",
    budget: 10000,
    key_messages: ["What changed, who it is for, and the first 3 steps"],
    creator_guidelines: "Disclose the partnership. No claims beyond shipped features.",
    content_direction: "Before/after with a concrete workflow",
    product: "",
    desired_outcome: "200 signups",
    lead_target: 60,
    category: "Launch",
  },
  {
    id: "tpl-demand",
    name: "Demand gen always-on",
    description: "Rolling six-week pipeline push across mixed niches.",
    objective: "Lead generation",
    target_audience: "Mid-market operators who feel a reporting gap",
    budget: 14000,
    key_messages: ["The cost of not knowing which work slipped"],
    creator_guidelines: "Every post must contain one measurable recommendation.",
    content_direction: "Diagnosis first, product second",
    product: "",
    desired_outcome: "120 qualified demos",
    lead_target: 120,
    category: "Demand gen",
  },
  {
    id: "tpl-thought",
    name: "Thought leadership series",
    description: "Six-post series on a single technical position.",
    objective: "Thought leadership",
    target_audience: "Practitioners who already know the basics",
    budget: 7500,
    key_messages: ["A position worth disagreeing with"],
    creator_guidelines: "Take a side. Cite published sources only.",
    content_direction: "Argument-led, product as footnote",
    product: "",
    desired_outcome: "50 inbound conversations",
    lead_target: 50,
    category: "Brand",
  },
];

// ── Notifications ───────────────────────────────────────────────────────────
// `type` values must match the TYPE_ICONS keys in NotificationCenter.jsx, which
// are the same strings src/lib/notifications.js writes when it raises a real
// alert. An unrecognised type silently falls back to the generic Info glyph.
export const notifications = [
  {
    id: "n-1",
    type: "lead_goal_50",
    title: "FlowPilot passed 50% of its lead target",
    message: "FlowPilot has generated 62 of 150 target leads with 31 days remaining.",
    campaign_id: "camp-flowpilot",
    campaign_name: "FlowPilot Launch",
    severity: "success",
    read: false,
    action_url: "/app/campaigns/camp-flowpilot",
  },
  {
    id: "n-2",
    type: "draft_submitted",
    title: "Draft waiting for review",
    message: "Sofia Marin submitted a draft for FlowPilot Launch.",
    campaign_id: "camp-flowpilot",
    campaign_name: "FlowPilot Launch",
    severity: "info",
    read: false,
    action_url: "/app/campaigns/camp-flowpilot",
  },
  {
    id: "n-3",
    type: "budget_80",
    title: "People Ops Reboot is 80% through budget",
    message: "EUR 6,800 of EUR 8,500 committed across 2 creators.",
    campaign_id: "camp-peopleops",
    campaign_name: "People Ops Reboot",
    severity: "warning",
    read: false,
    action_url: "/app/campaigns/camp-peopleops",
  },
  {
    id: "n-4",
    type: "campaign_status",
    title: "Fintech Trust Series completed",
    message: "All posts are live. Executive report is ready to review.",
    campaign_id: "camp-fintrust",
    campaign_name: "Fintech Trust Series",
    severity: "success",
    read: true,
    action_url: "/app/campaigns/camp-fintrust",
  },
  {
    id: "n-5",
    type: "payment_due",
    title: "Payment due for Aiko Tanaka",
    message: "EUR 900 for the Analytics Teardown post is due on 28 Sep.",
    campaign_id: "camp-peopleops",
    campaign_name: "People Ops Reboot",
    severity: "critical",
    read: true,
    action_url: "/app/payments",
  },
];

// ── Saved creators (CRM) ────────────────────────────────────────────────────
export const favorites = withCreatorFields([
  {
    id: "fav-1",
    creator_id: "marcus-bell",
    creator_name: "Marcus Bell",
    creator_avatar: "",
    creator_niche: "DevTools",
    creator_headline: "Shipping DevTools content weekly",
    creator_followers: 27000,
    creator_price: 400,
    notes: "Strong on delivery-process stories. Prefers technical hooks.",
    tag: "Dev tools",
    pipeline_stage: "Contacted",
    created_by_id: "seed-company",
  },
  {
    id: "fav-2",
    creator_id: "elena-petrova",
    creator_name: "Elena Petrova",
    creator_avatar: "",
    creator_niche: "HR Tech",
    creator_headline: "HR tech for people leaders",
    creator_followers: 19000,
    creator_price: 320,
    notes: "Best fit for anything onboarding related.",
    tag: "People",
    pipeline_stage: "Shortlisted",
    created_by_id: "seed-company",
  },
  {
    id: "fav-3",
    creator_id: "tom-eriksen",
    creator_name: "Tom Eriksen",
    creator_avatar: "",
    creator_niche: "FinTech",
    creator_headline: "FinTech explained without the jargon",
    creator_followers: 54000,
    creator_price: 750,
    notes: "Regulated audience. Needs a review pass before publishing.",
    tag: "Finance",
    pipeline_stage: "Saved",
    created_by_id: "seed-company",
  },
]);

// Creators invited to a campaign but not yet accepted, which is what the
// company marketplace and creator opportunities pages join against.
export const pendingCreatorIds = CREATOR_IDS.slice(0, 4);

// Creator pages scope rows by creator_name, so the sample data is anchored to one
// named sample creator. A new account has no rows under its own name and picks
// these up; an account with real rows keeps them.
//
// Re-exported from creators.js rather than repeated, so the profile editor and
// the campaign rows can never point at different people.
export { DEMO_PROFILE_SEED_NAME as DEMO_CREATOR_NAME } from "./creators";
