import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-lg text-white">CreatorFlow</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Turn LinkedIn creators into your best acquisition channel.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/for-companies" className="hover:text-white transition-colors">For companies</Link></li>
              <li><Link to="/for-agencies" className="hover:text-white transition-colors">For agencies</Link></li>
              <li><Link to="/for-creators" className="hover:text-white transition-colors">For creators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Get started</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Launch a campaign</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Become a creator</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-sm text-slate-500">© 2026 CreatorFlow. All rights reserved.</p>
          <p className="text-sm text-slate-500">Built as a functional MVP inspired by naano.com</p>
        </div>
      </div>
    </footer>
  );
}