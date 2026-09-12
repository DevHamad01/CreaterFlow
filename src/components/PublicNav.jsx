import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const solutions = [
    { label: "For companies", path: "/for-companies", desc: "Find creators and track pipeline" },
    { label: "For agencies", path: "/for-agencies", desc: "Manage multiple client campaigns" },
    { label: "For creators", path: "/for-creators", desc: "Get paid to post on LinkedIn" },
  ];

  const links = [
    { label: "Marketplace", path: "/marketplace" },
    { label: "How it works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-lg text-slate-900 tracking-tight">CreatorFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {/* Solutions dropdown */}
            <div className="relative">
              <button
                onClick={() => setSolutionsOpen(!solutionsOpen)}
                onMouseLeave={() => setSolutionsOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Solutions
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
              </button>
              {solutionsOpen && (
                <div
                  onMouseEnter={() => setSolutionsOpen(true)}
                  onMouseLeave={() => setSolutionsOpen(false)}
                  className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-lg py-2"
                >
                  {solutions.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      onClick={() => setSolutionsOpen(false)}
                      className="block px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {links.map((l) => (
              <Link key={l.path} to={l.path} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate("/app")} className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Go to dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                  Sign in
                </button>
                <button onClick={() => navigate("/signup")} className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                  Get started
                </button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">Solutions</p>
            {solutions.map((s) => (
              <Link key={s.path} to={s.path} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                {s.label}
              </Link>
            ))}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">Product</p>
            {links.map((l) => (
              <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 px-3">
              {isAuthenticated ? (
                <button onClick={() => { setOpen(false); navigate("/app"); }} className="flex-1 text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white">
                  Go to dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => { setOpen(false); navigate("/login"); }} className="flex-1 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-700">
                    Sign in
                  </button>
                  <button onClick={() => { setOpen(false); navigate("/signup"); }} className="flex-1 text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 text-white">
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}