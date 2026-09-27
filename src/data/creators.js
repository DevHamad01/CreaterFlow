// Sample creator records for the Home featured grid and the marketplace.
//
// The field names deliberately match the Base44 `Creator` entity that the live
// marketplace reads (see src/pages/Marketplace.jsx), so these rows render
// through the same components as real records. When the backend is wired up,
// delete this file and the pages fall back to the API with no other change.
//
// All data here is sample data for the UI build.

const SAMPLE = [
  {
    id: "sofia-marin",
    name: "Sofia Marin",
    headline: "SEO content that ranks and converts",
    niche: "SEO & SaaS",
    sub_niches: ["Technical SEO"],
    city: "Lisbon",
    country: "Portugal",
    linkedin_followers: 48000,
    engagement_rate: 4.8,
    price_per_post: 650,
    availability: "Available",
    verified: true,
  },
  {
    id: "daniel-roth",
    name: "Daniel Roth",
    headline: "GTM lessons from 40 SaaS launches",
    niche: "Sales & GTM",
    sub_niches: ["RevOps"],
    city: "Berlin",
    country: "Germany",
    linkedin_followers: 32000,
    engagement_rate: 5.1,
    price_per_post: 480,
    availability: "Available",
    verified: true,
  },
  {
    id: "aiko-tanaka",
    name: "Aiko Tanaka",
    headline: "Marketing analytics, minus the fluff",
    niche: "Marketing analytics",
    sub_niches: ["Attribution"],
    city: "Tokyo",
    country: "Japan",
    linkedin_followers: 61000,
    engagement_rate: 3.9,
    price_per_post: 900,
    availability: "Limited",
    verified: true,
  },
  {
    id: "marcus-bell",
    name: "Marcus Bell",
    headline: "Shipping DevTools content weekly",
    niche: "DevTools",
    sub_niches: ["Open source"],
    city: "Dublin",
    country: "Ireland",
    linkedin_followers: 27000,
    engagement_rate: 6.2,
    price_per_post: 400,
    availability: "Available",
    verified: false,
  },
  {
    id: "elena-petrova",
    name: "Elena Petrova",
    headline: "HR tech for people leaders",
    niche: "HR Tech",
    sub_niches: ["Future of work"],
    city: "Amsterdam",
    country: "Netherlands",
    linkedin_followers: 19000,
    engagement_rate: 5.6,
    price_per_post: 320,
    availability: "Booked",
    verified: true,
  },
  {
    id: "tom-eriksen",
    name: "Tom Eriksen",
    headline: "FinTech explained without the jargon",
    niche: "FinTech",
    sub_niches: ["Payments"],
    city: "Copenhagen",
    country: "Denmark",
    linkedin_followers: 54000,
    engagement_rate: 4.2,
    price_per_post: 750,
    availability: "Available",
    verified: false,
  },
];

// No avatar_url on purpose: CreatorCard falls back to a generated initials
// avatar, which is what real records without a photo will do too.
export const creators = SAMPLE;

export const AVAILABILITY = {
  Available: { pill: "bg-success/10 text-success" },
  Limited: { pill: "bg-warning/10 text-warning" },
  Booked: { pill: "bg-muted text-muted-foreground" },
};

export function availabilityPill(value) {
  return AVAILABILITY[value]?.pill ?? AVAILABILITY.Booked.pill;
}

export function formatPriceEUR(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export const NICHES = [...new Set(SAMPLE.map((c) => c.niche))].sort();
