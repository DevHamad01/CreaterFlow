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
