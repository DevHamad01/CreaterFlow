// Sample creator records for the Home featured grid, the marketplace, the
// public profile page and the creator profile editor.
//
// The field names and value casing deliberately match the Base44 `Creator`
// entity in base44/entities/Creator.json, so these rows render through the same
// components, selectors and match scoring as live records. When the backend is
// populated, delete this file and the pages fall back to the API with no other
// change.
//
// Two things that are easy to get wrong and were wrong here before:
//
// 1. `availability` is lowercase ("available" | "limited" | "booked"), matching
//    the entity enum. Capitalised values silently scored zero on the
//    availability component of the match score (lib/intelligence.js), missed
//    the lookup in CreatorDetail, and fell through to
//    "Availability hasn't been updated yet" on the public profile.
// 2. Every optional field the profile page and the editor read is populated
//    here. A record missing them renders as "—" and "This creator hasn't added
//    a bio yet", which reads as a bug on a public page rather than as sample
//    data.
//
// No avatar_url on purpose: CreatorCard and CreatorDetail both fall back to a
// generated initials avatar, which is what real records without a photo do too.
//
// All data here is sample data. Names, companies, people and numbers are
// invented. Nothing here refers to a real person, brand or transaction.

const SAMPLE = [
  {
    id: "sofia-marin",
    name: "Sofia Marin",
    headline: "SEO content that ranks and converts",
    bio: "I run technical SEO for B2B SaaS. Ten years in, agency-side and in-house, which is why my posts argue from crawl budgets and log files rather than from best-practice folklore. I publish one long-form breakdown a week and a short teardown when something interesting breaks.",
    niche: "Marketing & Content",
    sub_niches: ["Technical SEO", "Content Strategy"],
    city: "Lisbon",
    country: "Portugal",
    linkedin_followers: 48000,
    engagement_rate: 4.8,
    audience_type: "Marketing leaders and SEO practitioners at B2B software companies",
    audience_industries: ["SaaS", "MarTech", "E-commerce"],
    audience_geography: ["Portugal", "Spain", "United Kingdom", "Netherlands"],
    price_per_post: 650,
    availability: "available",
    rating: 4.9,
    reviews_count: 34,
    avg_impressions: 41200,
    avg_clicks: 1980,
    avg_leads: 23,
    languages: ["English", "Portuguese", "Spanish"],
    verified: true,
    total_campaigns: 41,
  },
  {
    id: "daniel-roth",
    name: "Daniel Roth",
    headline: "GTM lessons from 40 SaaS launches",
    bio: "I have sat on the GTM side of forty B2B launches, from two-person startups to post-Series-C. Everything I post is a post-mortem of something that actually happened, including the ones that flopped. No growth hacks I have not watched fail first.",
    niche: "Sales & GTM",
    sub_niches: ["RevOps", "Sales Enablement"],
    city: "Berlin",
    country: "Germany",
    linkedin_followers: 32000,
    engagement_rate: 5.1,
    audience_type: "Revenue leaders, founders and sales managers at B2B SaaS",
    audience_industries: ["SaaS", "Fintech", "HR Tech"],
    audience_geography: ["Germany", "Austria", "Switzerland", "United States"],
    price_per_post: 480,
    availability: "available",
    rating: 4.7,
    reviews_count: 28,
    avg_impressions: 36400,
    avg_clicks: 1520,
    avg_leads: 19,
    languages: ["German", "English"],
    verified: true,
    total_campaigns: 36,
  },
  {
    id: "aiko-tanaka",
    name: "Aiko Tanaka",
    headline: "Marketing analytics, minus the fluff",
    bio: "Analytics lead turned independent analyst. I take apart attribution models for a living and my recurring conclusion is that most dashboards are measuring the wrong thing. Posts are written for the person who has to defend a budget with the numbers in them.",
    niche: "Data & Analytics",
    sub_niches: ["Attribution", "Marketing Measurement"],
    city: "Tokyo",
    country: "Japan",
    linkedin_followers: 61000,
    engagement_rate: 3.9,
    audience_type: "Data-literate marketers and analytics engineers",
    audience_industries: ["SaaS", "E-commerce", "Media"],
    audience_geography: ["Japan", "Singapore", "United States", "Australia"],
    price_per_post: 900,
    availability: "limited",
    rating: 4.6,
    reviews_count: 19,
    avg_impressions: 58400,
    avg_clicks: 2210,
    avg_leads: 27,
    languages: ["Japanese", "English"],
    verified: true,
    total_campaigns: 24,
  },
  {
    id: "marcus-bell",
    name: "Marcus Bell",
    headline: "Shipping DevTools content weekly",
    bio: "Staff engineer who kept getting asked the same questions by people outside the team, so I started answering them in public. Weekly posts on build systems, release engineering and the parts of developer experience that actually move retention. I take a side in every post, which has cost me some clients and gained me more.",
    niche: "DevTools & Engineering",
    sub_niches: ["Open Source", "Developer Experience"],
    city: "Dublin",
    country: "Ireland",
    linkedin_followers: 27000,
    engagement_rate: 6.2,
    audience_type: "Engineering managers and senior developers",
    audience_industries: ["DevTools", "Infrastructure", "SaaS"],
    audience_geography: ["Ireland", "United Kingdom", "Netherlands", "Canada"],
    price_per_post: 400,
    availability: "available",
    rating: 4.8,
    reviews_count: 31,
    avg_impressions: 29900,
    avg_clicks: 1740,
    avg_leads: 21,
    languages: ["English", "Irish"],
    verified: false,
    total_campaigns: 29,
  },
  {
    id: "elena-petrova",
    name: "Elena Petrova",
    headline: "HR tech for people leaders",
    bio: "I write about the operational side of people management: onboarding that sticks, performance conversations people do not dread, and the HR software that claims to fix both. Fifteen years in HR operations, currently consulting to companies between fifty and five hundred staff.",
    niche: "HR & Recruiting",
    sub_niches: ["Future of Work", "People Operations"],
    city: "Amsterdam",
    country: "Netherlands",
    linkedin_followers: 19000,
    engagement_rate: 5.6,
    audience_type: "People leaders and HR managers at scaling companies",
    audience_industries: ["HR Tech", "SaaS", "Professional Services"],
    audience_geography: ["Netherlands", "Belgium", "Germany", "Denmark"],
    price_per_post: 320,
    availability: "booked",
    rating: 4.5,
    reviews_count: 17,
    avg_impressions: 18700,
    avg_clicks: 980,
    avg_leads: 12,
    languages: ["Dutch", "English", "Russian"],
    verified: true,
    total_campaigns: 22,
  },
  {
    id: "tom-eriksen",
    name: "Tom Eriksen",
    headline: "FinTech explained without the jargon",
    bio: "Payments engineer, recovered explainer. Open banking, embedded finance and cross-border settlement get written about as if the reader already agreed to the premise. My job is to start from the problem and get there without a single acronym. Regulated audiences get a review pass before anything goes out.",
    niche: "Fintech",
    sub_niches: ["Payments", "Open Banking"],
    city: "Copenhagen",
    country: "Denmark",
    linkedin_followers: 54000,
    engagement_rate: 4.2,
    audience_type: "Product and finance leaders at payments and banking companies",
    audience_industries: ["Fintech", "Banking", "InsurTech"],
    audience_geography: ["Denmark", "Sweden", "Norway", "Finland"],
    price_per_post: 750,
    availability: "available",
    rating: 4.7,
    reviews_count: 26,
    avg_impressions: 48700,
    avg_clicks: 2050,
    avg_leads: 25,
    languages: ["Danish", "English", "Swedish"],
    verified: false,
    total_campaigns: 33,
  },
];

export const creators = SAMPLE;

export const AVAILABILITY = {
  available: { pill: "bg-success/10 text-success" },
  limited: { pill: "bg-warning/10 text-warning" },
  booked: { pill: "bg-muted text-muted-foreground" },
};

export function availabilityPill(value) {
  return AVAILABILITY[value]?.pill ?? AVAILABILITY.booked.pill;
}

export function formatPriceEUR(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export const NICHES = [...new Set(SAMPLE.map((c) => c.niche))].sort();

// The sample creator the profile editor opens with when the signed-in account
// has no profile of its own. Every other creator page scopes by creator_name, so
// a new account matches nothing; anchoring the form to one sample creator means
// the editor opens populated and visibly editable rather than blank.
export const DEMO_PROFILE_SEED_NAME = "Marcus Bell";
