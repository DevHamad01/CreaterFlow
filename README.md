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

## Architecture

```
src/
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
└── base44/
    └── entities/              # Data schemas
``