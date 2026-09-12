import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Check, BadgeCheck } from "lucide-react";

const NICHES = ["AI & SaaS", "Sales & GTM", "Marketing & Content", "DevTools & Engineering", "Fintech", "HR & Recruiting", "Product & Design", "RevOps & Automation", "Data & Analytics", "Cybersecurity"];

export default function CreatorProfileEdit() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Try to find existing creator profile by name
    base44.entities.Creator.filter({ name: user.full_name })
      .then((creators) => {
        if (creators.length > 0) {
          setProfile(creators[0]);
        } else {
          // Create a new profile
          setProfile({
            name: user.full_name || "",
            headline: "",
            bio: "",
            niche: "AI & SaaS",
            sub_niches: [],
            country: "",
            city: "",
            linkedin_followers: 0,
            engagement_rate: 0,
            audience_type: "",
            audience_industries: [],
            audience_geography: [],
            price_per_post: 500,
            availability: "available",
            rating: 5,
            reviews_count: 0,
            avg_impressions: 0,
            avg_clicks: 0,
            avg_leads: 0,
            languages: ["English"],
            verified: false,
            total_campaigns: 0,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const update = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile.id) {
        await base44.entities.Creator.update(profile.id, profile);
      } else {
        await base44.entities.Creator.create(profile);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="h-96 bg-slate-100 rounded-2xl" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
        <p className="text-sm text-slate-500 mt-1">This is how brands see you in the marketplace</p>
      </div>

      {/* Profile preview */}
      <div className="bg-gradient-to-b from-sky-50/60 to-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=2563eb`}
            alt=""
            className="w-16 h-16 rounded-2xl bg-slate-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">{profile.name || "Your name"}</h2>
              {profile.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
            </div>
            <p className="text-sm text-slate-500">{profile.headline || "Add a headline"}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.niche} · €{profile.price_per_post}/post</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Profile information</h2>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Headline</label>
          <input value={profile.headline} onChange={(e) => update("headline", e.target.value)} placeholder="B2B & AI Creator · Sales workflows" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Bio</label>
          <textarea value={profile.bio} onChange={(e) => update("bio", e.target.value)} rows={3} placeholder="Tell brands about your content and audience..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Niche</label>
            <select value={profile.niche} onChange={(e) => update("niche", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Price per post (€)</label>
            <input type="number" value={profile.price_per_post} onChange={(e) => update("price_per_post", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Country</label>
            <input value={profile.country} onChange={(e) => update("country", e.target.value)} placeholder="France" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">City</label>
            <input value={profile.city} onChange={(e) => update("city", e.target.value)} placeholder="Paris" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Audience</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">LinkedIn followers</label>
            <input type="number" value={profile.linkedin_followers} onChange={(e) => update("linkedin_followers", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Engagement rate (%)</label>
            <input type="number" step="0.1" value={profile.engagement_rate} onChange={(e) => update("engagement_rate", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Audience type</label>
          <input value={profile.audience_type} onChange={(e) => update("audience_type", e.target.value)} placeholder="Founders & Sales Leaders" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Availability</label>
          <select value={profile.availability} onChange={(e) => update("availability", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saving ? "Saving..." : saved ? "Saved!" : "Save profile"}
      </button>
    </div>
  );
}