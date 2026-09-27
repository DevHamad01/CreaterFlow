# CreatorFlow — B2B LinkedIn Creator Marketplace

A full-stack B2B influencer marketing platform where companies discover vetted LinkedIn creators, launch AI-powered campaigns, manage content review, track performance, and process payments — all in one place.

## What It Does

**For Companies & Agencies:**
- Browse a curated marketplace of 3,000+ B2B LinkedIn creators across 10 niches
- Launch campaigns with an AI Campaign Copilot (strategy generation, creator matching, performance simulation)
- Manage the full campaign lifecycle: Draft → Recruiting → Active → Review → Live → Completed
- Review and approve creator content drafts with AI-assisted feedback
- Track clicks, leads, and pipeline value per creator with rich visualizations
- Get automatic notifications when campaigns hit budget or lead targets
- Save and reuse campaign briefs as templates
- Bulk-invite creators to campaigns from the marketplace
- Compare creators side-by-side with match scoring

**For Creators:**
- Browse brand campaign opportunities
- Accept deals and negotiate pricing
- Submit content drafts for brand review
- Track earnings and payment status
- Build a discoverable marketplace profile

## Key Features

### AI-Powered Campaign Copilot
- Generates campaign strategy, positioning, and briefs from a few inputs
- Ranks creators by match score (niche fit, audience match, engagement, price)
- Simulates estimated campaign outcomes before launch
- Generates per-creator content angles so no two creators get identical instructions
- AI content review for draft feedback
- Post-campaign executive summary reports

### Intelligent Creator Matching
- Data-driven fit scores based on niche, audience overlap, geography, engagement, and historical performance
- Campaign-specific match scoring (select a campaign, see real-time match %)
- Side-by-side creator comparison
- Bulk selection with multi-creator campaign invites

### Notification System
- Automatic alerts when campaigns hit 80% and 100% of budget
- Automatic alerts when campaigns reach 50% and 100% of lead targets
- Bell icon in sidebar with unread badge and dropdown

### Campaign Templates
- Save campaign settings (objective, audience, budget, guidelines, key messages) as reusable templates
- Load templates to skip AI strategy generation for repeatable campaign types
- Categorize templates (lead gen, awareness, product launch, etc.)

### Creator CRM
- Save creators with notes, tags, and pipeline stages
- Track outreach status from discovery through contracting
- Filter by pipeline stage

### Rich Analytics
- Per-campaign and cross-campaign performance dashboards
- Recharts visualizations: bar charts, area trends, pie breakdowns
- Spend vs. pipeline comparison
- Budget allocation recommendations

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Base44 (auth, database, integrations, hosting)
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** Base44 InvokeLLM integration

## Entity Model

| Entity | Purpose |
|--------|---------|
| Company | Company profiles |
| Creator | Creator marketplace profiles |
| Campaign | Marketing campaigns with budgets, briefs, and goals |
| CampaignCreator | Junction: creators invited to campaigns with fit scores and status |
| Post | Content drafts submitted for review |
| CampaignMetric | Per-post performance data (impressions, clicks, leads) |
| Lead | Leads attributed to campaign posts |
| Payment | Creator payouts and company charges |
| Favorite | Saved creators (CRM with notes, tags, pipeline stages) |
| Notification | Alert records for budget/lead goal thresholds |
| CampaignTemplate | Reusable campaign brief templates |

## Getting Started

```bash
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + frontend
```

Open the URL that `base44 dev` prints (typically `http://localhost:5173`).

### Configuration

The app needs a Firebase project and a Gemini API key.

**Firebase config is committed**, in `src/config/firebase.js`. This is
deliberate. Firebase *web app* config is not a secret — it identifies the
project, it does not authenticate anything, and Firebase's own docs say so.
Every web app ships it to the browser, and access control comes from Firestore
Security Rules and per-user auth tokens instead.

It has to be committed because the app deploys by building the git repository,
and `.env.local` is gitignored. A build on the host never sees `.env.local`, so
before this file existed every `VITE_FIREBASE_*` came back `undefined` and the
entire site loaded the signed-out stub. The only console symptom was a
misleading `TypeError: Cannot read properties of undefined (reading
'settings')` — Firebase choking on a stub that was never a real Auth object —
which read as "sign-in is broken" rather than "the build had no config".
`VITE_FIREBASE_*` in the environment still overrides the committed values.

**The Gemini key is not committed**, because it authorises billable quota. Set
it in the host's encrypted environment variables.

```bash
cp .env.local.example .env.local
# only needed for local dev: overrides the committed Firebase values and adds
# VITE_GEMINI_API_KEY
npm run doctor
```

`npm run doctor` is the preflight for this project. It reads `.env.local`,
probes each service, and prints a copy-pasteable fix for anything broken. It
never prints your keys. It also reports the two console switches that adding a
key cannot fix:

1. **The Cloud Firestore API must be enabled for the project.** A brand-new
   project has never called Firestore, so the API is off and every read and
   write fails with `PERMISSION_DENIED: Cloud Firestore API has not been used
   in project … before or it is disabled` until you switch it on.
   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview
2. **Sign-in providers must be enabled** in the Firebase console
   (Authentication > Sign-in method). A project with a valid API key still
   rejects sign-in with `auth/operation-not-allowed` until Email/Password is
   switched on. Google sign-in also needs the provider enabled and your deploy
   domain added to the authorised domains list.

### Working on the AI layer

`npm run check:ai` calls the real Gemini endpoint and asserts that each AI
response matches the field names the UI actually reads. Run it after changing a
prompt or a JSON schema in `src/lib/campaignAi.js`, since a mismatch between
the two is invisible until someone clicks the button.

It makes several real model calls, so it burns through a free-tier quota
quickly. An exhausted quota is reported as a skip, not a failure, because it
says nothing about the code. Use it deliberately rather than on every save.

`gemini-flash-latest` and the other `-latest` aliases also drift upstream. The
model is pinned via `VITE_GEMINI_MODEL`; if you change it, update
`.env.local.example` too so the next person does not inherit a dead model.

### Sample data, and removing it

Every screen is populated with sample data, so a fresh clone and a fresh account
both render a working product rather than a grid of empty states:

- `src/data/creators.js` — the public marketplace, the Home featured grid, the
  public creator profile page, and the creator profile editor.
- `src/data/app.js` — the signed-in company and creator workspaces: campaigns,
  campaign creators, posts, metrics, leads, payments, templates, notifications
  and the saved-creator CRM.
- `src/data/stats.js` — marketing copy and figures on the landing pages.

The rule is in `src/lib/seeded.js`: a page initialises from its seed and only
replaces it when the live response actually has rows, so a non-empty backend
always wins and the seeds can be deleted one file at a time. `preferLive` guards
against an empty response wiping a populated screen.

To delete all of it: remove the seeds, and the pages fall back to the API with no
other change.

### Deploying: the Gemini key ships in the client

Anything prefixed `VITE_` is baked into the JavaScript at build time, so a
prebuilt `dist` upload ships the Gemini key to every visitor and it can be
lifted from devtools. Two ways to handle it, best first:

- **Deploy from the git repository** and set `VITE_GEMINI_API_KEY` as an
  encrypted environment variable in the Cloudflare Pages dashboard. The build
  runs on Cloudflare's side, so the key never enters a zip, a commit, or this
  machine. Firebase needs nothing set there; its config is committed.
- **Upload a prebuilt `dist`**, and either restrict the key first or accept that
  it is public: Google Cloud console > APIs & Services > Credentials > your key
  > Application restrictions (Websites, your deploy domain) + API restrictions
  (Generative Language API). A referrer-restricted key cannot be called from
  another origin, which is what stops someone draining your quota.


## Architecture

```
src/
├── config/
│   └── firebase.js          # Committed public Firebase web config
├── pages/
│   ├── Home.jsx              # Public landing page
│   ├── Marketplace.jsx       # Public creator marketplace
│   ├── ForCreators.jsx       # Creator landing page
│   ├── ForAgencies.jsx       # Agency landing page
│   ├── ForCompanies.jsx      # Company landing page
│   ├── company/              # Authenticated company app
│   │   ├── Dashboard.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CampaignDetail.jsx
│   │   ├── NewCampaign.jsx
│   │   ├── CompanyMarketplace.jsx
│   │   ├── SavedCreators.jsx  # Creator CRM
│   │   ├── Analytics.jsx
│   │   ├── Payments.jsx
│   │   └── Settings.jsx
│   └── creator/              # Authenticated creator app
│       ├── CreatorDashboard.jsx
│       ├── Opportunities.jsx
│       ├── MyCampaigns.jsx
│       ├── Earnings.jsx
│       └── CreatorProfileEdit.jsx
├── components/
│   ├── AppSidebar.jsx        # Layout + navigation + notification bell
│   ├── NotificationCenter.jsx
│   ├── TemplateSelector.jsx
│   ├── CreatorCard.jsx
│   ├── intelligence/         # AI-powered components
│   │   ├── MatchScoreBadge.jsx
│   │   ├── CampaignHealthBadge.jsx
│   │   ├── SmartRecommendations.jsx
│   │   ├── AIContentReview.jsx
│   │   ├── CampaignSimulator.jsx
│   │   ├── CampaignReport.jsx
│   │   ├── BudgetRecommendations.jsx
│   │   └── ComparisonModal.jsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── intelligence.js       # Matching, scoring, simulation engine
│   ├── campaignAi.js         # AI strategy, content review, report generation
│   └── notifications.js       # Campaign alert detection
│   ├── api/
│   │   └── base44Client.js      # Firebase + Base44-style entity facade
│   ├── data/                    # Sample data, deletable once populated
│   │   ├── creators.js          # Marketplace, Home grid, creator profile
│   │   ├── app.js               # Company + creator workspaces
│   │   └── stats.js             # Landing-page marketing figures
└── base44/
    └── entities/              # Data schemas
``