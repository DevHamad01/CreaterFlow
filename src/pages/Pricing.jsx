import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Check, ChevronDown } from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: "What is Naano?", a: "Naano is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator." },
    { q: "How does per-post pricing work?", a: "Each creator sets their own price per sponsored post. You see the price upfront in the marketplace — no negotiating, no back-and-forth. You pay per post, not per hour or per campaign." },
    { q: "How does attribution work?", a: "Every creator gets a unique tracking link for each campaign. Naano tracks clicks, qualified clicks, and leads generated from each post, so you can see exactly which creators drive pipeline." },
    { q: "Do you handle creator payouts?", a: "Yes. Naano handles creator payouts automatically. Creators get paid within 24h of their post going live. No invoices, no chasing, no admin on your side." },
    { q: "Can I upgrade or cancel anytime?", a: "Yes. The self-serve plan is free forever. You only pay for creator posts when you launch a campaign. Managed campaigns can be cancelled with 30 days notice." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Pricing</h1>
        <p className="mt-4 text-lg text-slate-600">Start free. Upgrade when you want your time back.</p>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Self-serve */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Self-serve</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Run it yourself</h2>
              <p className="text-sm text-slate-500 mt-1">For teams that want the infrastructure to run creator campaigns in-house.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">€0</span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {["Creator marketplace access", "AI-powered brief creation", "Track clicks, leads and pipeline", "Automatic creator payouts", "Unlimited campaigns", "Performance analytics"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/signup")} className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
              Start for free
            </button>
          </div>

          {/* Managed */}
          <div className="bg-slate-900 rounded-3xl p-8 flex flex-col text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="mb-6">
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Managed campaigns</span>
                <h2 className="text-2xl font-bold mt-2">Get your time back</h2>
                <p className="text-sm text-slate-400 mt-1">For teams that want Naano to operate their creator channel end to end.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
                <p className="text-slate-400 text-sm mt-1">Based on campaign scope</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Campaign strategy and positioning", "Creator sourcing and coordination", "Brief creation and campaign launch", "Reporting and optimisation", "Dedicated account manager", "Monthly performance reviews"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/signup")} className="w-full py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors">
                Book a campaign call
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">Campaign spend is separate. No lock-in. Cancel anytime.</p>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-slate-900">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}