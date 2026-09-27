import AudiencePage from "@/components/AudiencePage";
import {
  Wallet, Megaphone, TrendingUp, Star,
  Clock, ShieldCheck, UserCircle, FileText, BarChart3
} from "lucide-react";

const FAQS = [
  {
    q: "Do I need a minimum follower count to join?",
    a: "No hard minimum, but most active creators on CreatorFlow have 5,000+ LinkedIn followers. What matters more is engagement rate, audience relevance, and content quality. Apply and we'll review your profile.",
  },
  {
    q: "How much can I earn per post?",
    a: "You set your own price per post. Most B2B creators on CreatorFlow charge between €200 and €2,000 per post depending on audience size, niche, and engagement. The average deal is €500.",
  },
  {
    q: "When do I get paid?",
    a: "Automatically, within 24 hours of your post going live. No invoices, no chasing, no spreadsheets. CreatorFlow handles the entire payment process.",
  },
  {
    q: "Can I decline campaigns?",
    a: "Absolutely. You're always in control. Review every brief, price, and timeline — accept or decline. No one can book you without your approval.",
  },
  {
    q: "Do I keep rights to my content?",
    a: "Yes. You create content in your own voice and publish it on your own LinkedIn profile. Brands review drafts before you publish, but the content is yours.",
  },
  {
    q: "Is there exclusivity?",
    a: "No. You're free to work with other brands, platforms, and agencies. CreatorFlow is non-exclusive. You keep 100% of what you earn.",
  },
];

export default function ForCreators() {
  return (
    <AudiencePage
      badge="2,000+ creators paid · 4.8/5 rating"
      badgeIcons={[Star]}
      headline="Get paid to post"
      accentWord="on LinkedIn"
      sub="Choose deals from B2B brands you know, post in your own voice, and get paid within 24 hours. No negotiating, no admin, no exclusivity. Creators earn €500 on average per deal."
      ctaLabel="Start earning"
      ctaNote="Join 2,000+ creators already getting paid to post. Free, non-exclusive, and you keep 100% of what you earn."
      benefitsHeading="Why creators choose CreatorFlow"
      benefitsSub="Everything you need to monetize your LinkedIn audience — without the admin."
      benefits={[
        {
          icon: Megaphone,
          title: "Find deals that fit",
          body: "Discover brand opportunities matched to your audience and niche. Accept or decline — you're always in control of what you post.",
        },
        {
          icon: TrendingUp,
          title: "Track your performance",
          body: "See views, clicks, and leads for every post in real time. Build a track record that earns you higher rates.",
        },
        {
          icon: Wallet,
          title: "Get paid automatically",
          body: "Payouts within 24h of your post going live. No invoices, no chasing, no spreadsheets. You keep 100% of what you earn.",
        },
      ]}
      stepsHeading="How it works"
      steps={[
        {
          num: "01",
          icon: UserCircle,
          title: "Set up your profile",
          body: "Add your LinkedIn, niche, audience info, and set your price per post. Takes 2 minutes — and you can update it anytime.",
        },
        {
          num: "02",
          icon: Megaphone,
          title: "Receive campaign opportunities",
          body: "Brands send you collaboration requests. Review the brief, price, and timeline — accept the ones that fit your audience.",
        },
        {
          num: "03",
          icon: FileText,
          title: "Create and submit your draft",
          body: "Write your post in your own voice. Submit for brand review. Get feedback or approval — all in one place.",
        },
        {
          num: "04",
          icon: BarChart3,
          title: "Publish, track, and get paid",
          body: "Once approved, schedule and publish. Track your performance and get paid automatically within 24h. No invoice needed.",
        },
      ]}
      stats={[
        { icon: Clock, display: "24h", label: "Average payout time" },
        { icon: Wallet, display: "€500", label: "Average deal value" },
        { icon: ShieldCheck, display: "100%", label: "Of what you earn is yours" },
      ]}
      faqs={FAQS}
    />
  );
}
