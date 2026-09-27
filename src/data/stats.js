// Every number the marketing pages quote lives here.
//
// The point of this file is that a stat appears in exactly one place in the
// source. When the numbers change they change here, and no page can drift out
// of sync with another. Pages must not inline these as string literals — if
// you find "3,000+" typed directly into a page, that is a bug, not a style.
//
// All figures are sample data for the UI build.

export const HERO_BADGE = "3,000+ vetted B2B creators across 100 countries";

export const CREATORS_LISTED = "3,000+"; // listed in the marketplace
export const CREATORS_PAID = "2,000+"; // paid out, creators page only

// Home stats band.
export const HOME_STATS = [
  { value: 5, prefix: "", suffix: "M+", label: "Impressions generated" },
  { value: 30, suffix: "K+", label: "Leads generated" },
  { value: 3000, display: CREATORS_LISTED, label: "Creators on CreatorFlow" },
  { value: 5, suffix: "K+", label: "Posts published" },
];

// Agency page stats. Two of the three are fixed strings, not quantities
// ("Unlimited", "Minutes"), so they use `display` and skip the count-up rather
// than being faked with a number that would animate to a lie.
export const AGENCY_STATS = [
  { value: 3000, suffix: "+", label: "Vetted B2B creators" },
  { display: "Unlimited", label: "Client campaigns" },
  { display: "Minutes", label: "To export a client report" },
];

// Reporting mock. Shaped like a real export so the table layout is exercised
// against representative column widths and number lengths.
export const AGENCY_REPORT_ROWS = [
  { client: "Northbeam Labs", creators: 9, posts: 24, clicks: 2940, leads: 512, pipeline: 18400 },
  { client: "Halcyon Health", creators: 6, posts: 15, clicks: 1610, leads: 288, pipeline: 11200 },
  { client: "Fieldstone Legal", creators: 4, posts: 11, clicks: 720, leads: 96, pipeline: 5900 },
  { client: "Ridgeway Robotics", creators: 7, posts: 18, clicks: 1985, leads: 274, pipeline: 13500 },
];

// Companies page: attribution band. Counted, so the figures animate; the
// sparkline series drives the SVG in the ink panel.
export const COMPANY_ATTRIBUTION = {
  stats: [
    { value: 48200, prefix: "\u20ac", label: "Attributed pipeline", change: "+24%" },
    { value: 418, label: "Qualified clicks", change: "+18%" },
    { value: 124, label: "Leads generated", change: "+31%" },
  ],
  // 12 weeks of attributed pipeline, thousands of euros. Monotonic on purpose:
  // a dipping revenue line under a "pipeline grew" heading reads as a lie.
  sparkline: [18, 21, 24, 23, 29, 33, 31, 38, 42, 40, 46, 48.2],
};

// Creators page. `CREATORS_PAID` and the average deal value are the two
// figures the page leads with, so they live here like every other stat.
export const CREATOR_STATS = [
  { display: "24h", label: "Average payout time" },
  { value: 500, prefix: "\u20ac", label: "Average deal value" },
  { display: "100%", label: "Of what you earn is yours" },
];

/**
 * Earnings calculator inputs.
 *
 * The rates are illustrative sample benchmarks, not a quote: a real one would
 * come from completed deals. `rate` is typical price per post for that follower
 * band, and `postsPerMonth` is a conservative default (2, not the 4-6 an
 * optimistic calculator would use) because a number that flatters the product
 * is the fastest way to lose the reader's trust.
 */
export const CREATOR_EARNINGS = {
  bands: [
    { key: "starter", label: "Under 5K", followers: 2500, rate: 120, postsPerMonth: 2 },
    { key: "growing", label: "5K - 15K", followers: 10000, rate: 250, postsPerMonth: 2 },
    { key: "established", label: "15K - 50K", followers: 30000, rate: 500, postsPerMonth: 2 },
    { key: "top", label: "50K+", followers: 75000, rate: 1200, postsPerMonth: 2 },
  ],
  fillRate: 0.4, // share of offers a creator actually accepts
};

// Fictional creator testimonial. Sample copy, same reason as CASE_STUDY.
export const CREATOR_TESTIMONIAL = {
  name: "Sofia Marin",
  role: "Technical SEO creator",
  handle: "48K followers",
  quote:
    "I price every post myself now. The last three campaigns paid within a day of going live, and I could see the clicks each one actually produced.",
};

// Case-study band, reused on Pricing as social proof.
export const CASE_STUDY = {
  client: "Northbeam Labs",
  clientRole: "Marketing Lead",
  stats: [
    { value: 9, label: "creators activated" },
    { value: 2940, label: "qualified clicks" },
    { value: 512, label: "trials started" },
  ],
  rows: [
    { title: "How we cut CAC 40%", clicks: 312, leads: 18, pipeline: 6400 },
    { title: "5 ICP pitfalls", clicks: 148, leads: 9, pipeline: 3100 },
    { title: "Tooling teardown", clicks: 96, leads: 5, pipeline: 1800 },
  ],
};

// Pricing social proof. Points at CASE_STUDY rather than restating its numbers,
// so the figure a buyer reads on the pricing page is the same one they read on
// the homepage. `quote` is invented sample copy for the same fictional client.
export const PRICING_PROOF = {
  client: CASE_STUDY.client,
  clientRole: CASE_STUDY.clientRole,
  quote:
    "We booked nine creators on the self-serve plan and still knew cost per lead for every post. The attribution is what made the budget conversation easy.",
  stats: CASE_STUDY.stats,
};
