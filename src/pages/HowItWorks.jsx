import { useNavigate } from "react-router-dom";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Search, FileText, Users, BarChart3, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    { icon: Search, title: "Find the right creators", desc: "Search 3,000+ vetted B2B creators by niche, audience, geography and price. Every creator profile shows audience type, engagement rate, and average performance per post.", points: ["Filter by niche, followers, price", "See fit scores for your campaign", "Save creators to shortlists"] },
    { icon: FileText, title: "Build your campaign brief with AI", desc: "Enter your product, target audience and objective. Naano's AI generates a structured brief with key messages, creator guidelines, and tracking links.", points: ["AI-generated key messages", "Creator guidelines", "Tracking links ready"] },
    { icon: Users, title: "Invite and collaborate with creators", desc: "Select creators from your shortlist, invite them to your campaign, and manage the entire collaboration in one place — from draft to approval.", points: ["One-click creator invites", "Draft review and approval", "Revision workflow"] },
    { icon: BarChart3, title: "Track attributed pipeline", desc: "Every post gets a unique tracking link. See impressions, clicks, qualified clicks, leads, and pipeline value — attributed to each creator and post.", points: ["Real-time performance tracking", "Per-creator attribution", "Lead capture and scoring"] },
    { icon: Wallet, title: "Pay creators without the admin", desc: "Naano handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no spreadsheets.", points: ["Automatic payouts", "Paid within 24h", "No invoice management"] },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">How Naano works</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">From finding creators to tracking pipeline — the complete workflow for B2B creator campaigns.</p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-6">
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-200 sm:hidden">{String(i + 1).padStart(2, "0")}</div>
              </div>
              <div className="flex-1">
                <div className="hidden sm:block text-sm font-bold text-blue-500 mb-1">{String(i + 1).padStart(2, "0")}</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h2>
                <p className="text-slate-600 mb-4">{step.desc}</p>
                <ul className="space-y-2">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-slate-50 rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-slate-900">Ready to launch your first campaign?</h2>
          <p className="mt-2 text-slate-600">Start free. Pay per post when you're ready.</p>
          <button onClick={() => navigate("/signup")} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
            Get started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}