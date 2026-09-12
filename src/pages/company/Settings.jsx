import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Check } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setCompanyName(user.company_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName, company_name: companyName, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and company profile</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Account</h2>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
          <input value={user?.email || ""} disabled className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Company name</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-2">Plan</h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Free plan</p>
            <p className="text-xs text-slate-500">Self-serve marketplace access</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span>
        </div>
      </div>
    </div>
  );
}