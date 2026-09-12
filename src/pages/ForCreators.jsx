import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import {
  Wallet, Megaphone, TrendingUp, Check, ArrowRight, Star,
  Clock, ShieldCheck, Zap, ChevronDown, UserCircle, FileText, BarChart3
} from "lucide-react";

const FAQS = [
  { q: "Do I need a minimum follower count to join?", a: "No hard minimum, but most active creators on Naano have 5,000+ LinkedIn followers. What matters more is engagement rate, audience relevance, and content quality. Apply and we'll review your profile." },
  { q: "How much can I earn per post?", a: "You set your own price per post. Most B2B creators on Naano charge between €200 and €2,000 per post depending on audience size, niche, and engagement. The average deal is €500." },
  { q: "When do I get paid?", a: "Automatically, within 24 hours of your post going live. No invoices, no chasing, no spreadsheets. Naano handles the entire payment process." },
  { q: "Can I decline campaigns?", a: "Absolutely. You're always in control. Review every brief, price, and timeline — accept or decline. No one can book you without your approval." },
  { q: "Do I keep rights to my content?", a: "Yes. You create content in your own voice and publish it on your own LinkedIn profile. Brands review drafts before you publish, but the content is yours." },
  { q: "Is there exclusivity?", a: "No. You're free to work with other brands, platforms, and agencies. Naano is non-exclusive. You keep 100% of what you earn." },
];

export default function ForCreators() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-6">
            <Star className="w-3.5 h-3.5" /> 2,000+ creators paid · 4.8/5 rating
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Get paid to post<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">on LinkedIn</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Choose deals from B2B brands you know, post in your own voice, and get paid within 24 hours. No negotiating, no admin, no exclusivity. Creators earn €500 on average per deal.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              Start earning <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-slate-500">Free to join · No exclusivity · Paid within 24h</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why creators choose Naano</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Everything you need to monetize your LinkedIn audience — without the admin.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Megaphone, title: "Find deals that fit", desc: "Discover brand opportunities matched to your audience and niche. Accept or decline — you're always in control of what you post." },
              { icon: TrendingUp, title: "Track your performance", desc: "See views, clicks, and leads for every post in real time. Build a track record that earns you higher rates." },
              { icon: Wallet, title: "Get paid automatically", desc: "Payouts within 24h of your post going live. No invoices, no chasing, no spreadsheets. You keep 100% of what you earn." },
            ].map((f) => (
              <div key={f.title} className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <f.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How it works</h2>
          <div className="space-y-4">
            {[
              { num: "01", icon: UserCircle, title: "Set up your profile", desc: "Add your LinkedIn, niche, audience info, and set your price per post. Takes 2 minutes — and you can update it anytime." },
              { num: "02", icon: Megaphone, title: "Receive campaign opportunities", desc: "Brands send you collaboration requests. Review the brief, price, and timeline — accept the ones that fit your audience." },
              { num: "03", icon: FileText, title: "Create and submit your draft", desc: "Write your post in your own voice. Submit for brand review. Get feedback or approval — all in one place." },
              { num: "04", icon: BarChart3, title: "Publish, track, and get paid", desc: "Once approved, schedule and publish. Track your performance and get paid automatically within 24h. No invoice needed." },
            ].map((step) => (
              <div key={step.num} className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-slate-200">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-500 mb-1">{step.num}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Clock, value: "24h", label: "Average payout time" },
              { icon: Wallet, value: "€500", label: "Average deal value" },
              { icon: ShieldCheck, value: "100%", label: "Of what you earn is yours" },
            ].map((s) => (
              <div key={s.label} className="p-8 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <s.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
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
          <h2 className="text-3xl font-bold tracking-tight">Start earning from your LinkedIn audience</h2>
          <p className="mt-4 text-slate-400">Join 2,000+ creators already getting paid to post. Free, non-exclusive, and you keep 100% of what you earn.</p>
          <button onClick={() => navigate("/signup")} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors">
            Apply now <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-4 text-xs text-slate-500">Takes 2 minutes. No commitment.</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}