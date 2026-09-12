import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import {
  Search, Sparkles, Users, FileText, BarChart3, Wallet,
  ArrowRight, CheckCircle2, TrendingUp, MousePointerClick, Target,
  ChevronDown, ShieldCheck, Zap
} from "lucide-react";

const FAQS = [
  { q: "How is Naano different from a creator agency?", a: "Naano is a self-serve marketplace. You find creators directly, see their price per post upfront, and manage campaigns yourself — no middleman, no markups. You stay in control of every collaboration." },
  { q: "How do I know a creator will reach my buyers?", a: "Every creator profile shows their audience type, audience industries, geography, languages, and engagement rate. You can also see their average performance per post — impressions, clicks, and leads — before you book." },
  { q: "What does the AI brief generator do?", a: "Enter your product, target audience, and objective. Naano generates a structured campaign brief with key messages, creator guidelines, content direction, and tracking links — in seconds. You can edit everything before sending." },
  { q: "How does attribution work?", a: "Every creator gets a unique tracking link for each campaign. Naano tracks clicks, qualified clicks, and leads generated from each post, so you can see exactly which creators drove pipeline — not just impressions." },
  { q: "Do you handle creator payments?", a: "Yes. Naano handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no spreadsheets on your side." },
  { q: "Is there a minimum commitment?", a: "No. The self-serve plan is free forever. You only pay for creator posts when you launch a campaign. Managed campaigns can be cancelled with 30 days notice." },
];

export default function ForCompanies() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" /> For companies & brands
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Turn LinkedIn creators<br />
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">into pipeline</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Find the creators your buyers already follow, launch campaigns in days, and track every click, lead, and dollar of pipeline — attributed to each post.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              Launch a campaign <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/marketplace")} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Browse creators
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">Free to start · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50/40 rounded-2xl p-8 border border-red-100">
              <h3 className="font-semibold text-slate-900 mb-4">The problem</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">B2B buyers don't click ads. They trust people.</p>
              <ul className="space-y-2.5">
                {["Ads are expensive and increasingly ignored", "Cold outreach response rates keep dropping", "In-house content takes months to build an audience", "Sponsored posts on random creators waste budget", "You can't measure what actually drove the lead"].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-50/40 rounded-2xl p-8 border border-emerald-100">
              <h3 className="font-semibold text-slate-900 mb-4">The Naano way</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">Reach buyers through the creators they already follow.</p>
              <ul className="space-y-2.5">
                {["Find creators your buyers already trust", "Pay per post — no retainer, no markup", "AI-assisted campaign briefs in seconds", "Full content review before anything goes live", "Click-to-pipeline attribution per post"].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">From brief to pipeline</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Everything you need to discover, launch, and measure creator campaigns.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "Discover creators", desc: "Search 3,000+ vetted B2B creators by niche, audience, geography, and price. See fit scores, engagement, and average performance before you book." },
              { icon: Sparkles, title: "Generate your brief", desc: "Enter your product and objective. AI generates key messages, creator guidelines, and tracking links. Edit and launch in minutes." },
              { icon: Users, title: "Invite & collaborate", desc: "Select creators, send invites, and manage the whole collaboration — drafts, revisions, approvals — in one place." },
              { icon: BarChart3, title: "Track attribution", desc: "Every post gets a tracking link. See impressions, clicks, qualified clicks, leads, and pipeline attributed per creator." },
              { icon: Target, title: "Measure ROI", desc: "Compare cost per lead, cost per click, and pipeline value across creators. Know exactly what drove results." },
              { icon: Wallet, title: "Pay creators", desc: "Automatic payouts within 24h of each post going live. No invoices, no chasing, no admin on your side." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attribution highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Attribution</span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Know which creators drove pipeline</h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Every creator gets a unique tracking link per campaign. Naano attributes clicks, qualified clicks, and leads back to the exact post — so you can prove ROI to your team and double down on what works.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, label: "Attributed pipeline", value: "€48.2K", change: "+24%" },
                  { icon: MousePointerClick, label: "Qualified clicks", value: "418", change: "+18%" },
                  { icon: Target, label: "Leads generated", value: "124", change: "+31%" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <m.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-slate-300">{m.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{m.value}</p>
                      <p className="text-xs text-emerald-400">{m.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Built for B2B marketing teams</h2>
          <p className="text-slate-600 mb-12">Trusted by modern SaaS companies to run their creator channels.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, label: "Vetted creators only", desc: "Every creator is reviewed before joining the marketplace." },
              { icon: FileText, label: "AI-assisted briefs", desc: "Generate structured campaign briefs in seconds." },
              { icon: BarChart3, label: "Pipeline attribution", desc: "Track clicks, leads, and revenue per post." },
            ].map((t) => (
              <div key={t.label} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <t.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{t.label}</h3>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Your next campaign starts here</h2>
          <p className="mt-4 text-slate-600">Find creators, generate a brief, and launch in minutes. Free to start.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/pricing")} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors">
              See pricing
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}