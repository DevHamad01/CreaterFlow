import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import {
  Search, FolderKanban, BarChart3, Users, Link2, TrendingUp,
  ArrowRight, CheckCircle2, Building2, Layers, Target, ChevronDown
} from "lucide-react";

const FAQS = [
  { q: "Can I manage multiple clients from one account?", a: "Yes. Agencies get a single workspace to manage all client campaigns, creators, and reporting. Each campaign is tagged to a client and isolated, so nothing leaks across accounts." },
  { q: "How does creator pricing work for agencies?", a: "Each creator sets their own price per post. You see the price upfront in the marketplace — no negotiating, no back-and-forth. You pay per post, not per hour or per campaign." },
  { q: "Can I build shared creator shortlists across clients?", a: "Yes. Build shortlists once and reuse them across client campaigns. Tag creators by industry, audience fit, or past performance so your team can move fast." },
  { q: "Do you offer white-label reporting?", a: "Agency plans include exportable reports with per-campaign, per-creator, and per-post breakdowns. Present pipeline and attribution data to your clients in minutes, not days." },
  { q: "How does attribution work across multiple campaigns?", a: "Every creator gets a unique tracking link per campaign. Naano attributes clicks, qualified clicks, and leads back to the specific post — so you can compare performance across all client campaigns in one dashboard." },
];

export default function ForAgencies() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/50 to-white py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium mb-6">
            <Layers className="w-3.5 h-3.5" /> For agencies & managed service providers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Run creator campaigns<br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">for every client</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Discover creators, manage multiple client campaigns, and report on attributed pipeline — all from one workspace. Replace spreadsheets, DMs, and manual tracking with a platform built for scale.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              Start managing clients <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/marketplace")} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              Browse the marketplace
            </button>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why agencies choose Naano</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Stop juggling tools. Run your entire creator operation in one place.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Building2, title: "Multi-client management", desc: "Manage every client campaign from a single workspace. Each campaign is tagged, isolated, and reportable per client." },
              { icon: Search, title: "Creator discovery at scale", desc: "Search 3,000+ vetted B2B creators by niche, audience, geography, and price. Build shortlists you can reuse across clients." },
              { icon: Link2, title: "Attribution that holds up", desc: "Every post gets a unique tracking link. Show clients exactly which creators drove clicks, leads, and pipeline — per post, per campaign." },
              { icon: BarChart3, title: "Centralized reporting", desc: "Export per-client, per-campaign, per-creator reports in minutes. Stop building slide decks from scratch every week." },
            ].map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <f.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">The agency workflow</h2>
          <div className="space-y-6">
            {[
              { num: "01", icon: Search, title: "Discover & shortlist creators", desc: "Search by niche, audience industry, geography, and price. Build reusable shortlists tagged by client or industry." },
              { num: "02", icon: FolderKanban, title: "Create client campaigns", desc: "Set up campaigns per client with objectives, budget, and target audience. Generate AI-assisted briefs in seconds." },
              { num: "03", icon: Users, title: "Invite & coordinate creators", desc: "Send invites, review drafts, request revisions, and approve content — all within the campaign workspace." },
              { num: "04", icon: Target, title: "Track attributed performance", desc: "Monitor impressions, clicks, qualified clicks, leads, and pipeline value attributed to each creator and post." },
              { num: "05", icon: BarChart3, title: "Report & scale", desc: "Export client-ready reports. Identify top-performing creators and scale what works across all your clients." },
            ].map((step) => (
              <div key={step.num} className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-violet-500 mb-1">{step.num}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Naano vs. managing creators manually</h2>
          <p className="text-center text-slate-500 mb-12">Stop losing hours to spreadsheets, DMs, and disconnected tools.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Manual creator management
              </h3>
              <ul className="space-y-3">
                {["Spreadsheets for creator shortlists", "DMs and emails for coordination", "Manual tracking links per post", "No attribution — guess what worked", "Hours building client reports", "No way to scale across clients"].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-red-400 mt-0.5">✕</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> With Naano
              </h3>
              <ul className="space-y-3">
                {["Searchable marketplace with fit scores", "Centralized campaign workspace", "Automatic tracking links per post", "Click-to-pipeline attribution", "Exportable client reports in minutes", "Scale top creators across all clients"].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Scale your creator operation</h2>
          <p className="mt-4 text-slate-400">Join agencies running creator campaigns for their clients on Naano.</p>
          <button onClick={() => navigate("/signup")} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors">
            Get started <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-4 text-xs text-slate-500">Free to start · No credit card required</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}