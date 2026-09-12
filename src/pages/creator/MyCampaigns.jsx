import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Briefcase, PenSquare, Loader2, Send, ExternalLink } from "lucide-react";

export default function MyCampaigns() {
  const { user } = useAuth();
  const [collabs, setCollabs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitDraft, setSubmitDraft] = useState(null);
  const [draftContent, setDraftContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const creatorName = user.full_name || "";
    Promise.all([
      base44.entities.CampaignCreator.filter({ creator_name: creatorName }, "-created_date"),
      base44.entities.Post.filter({ creator_name: creatorName }, "-created_date"),
    ]).then(([cc, p]) => {
      setCollabs(cc); setPosts(p);
      // Get campaign details
      Promise.all(cc.map((c) => base44.entities.Campaign.get(c.campaign_id).catch(() => null)))
        .then(setCampaigns);
    }).finally(() => setLoading(false));
  }, [user]);

  const getCampaign = (id) => campaigns.find((c) => c?.id === id);
  const getPost = (ccId) => posts.find((p) => p.campaign_creator_id === ccId);

  const submitDraftPost = async () => {
    setSaving(true);
    const cc = submitDraft;
    await base44.entities.Post.create({
      campaign_id: cc.campaign_id,
      campaign_creator_id: cc.id,
      creator_id: cc.creator_id,
      creator_name: cc.creator_name,
      content: draftContent,
      status: "submitted",
    });
    await base44.entities.CampaignCreator.update(cc.id, { status: "draft_submitted" });
    const updatedPosts = await base44.entities.Post.filter({ creator_name: user.full_name || "" }, "-created_date");
    setPosts(updatedPosts);
    const updatedCc = await base44.entities.CampaignCreator.filter({ creator_name: user.full_name || "" }, "-created_date");
    setCollabs(updatedCc);
    setSubmitDraft(null);
    setDraftContent("");
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-slate-200 rounded w-48" />{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">{collabs.length} collaborations</p>
      </div>

      {collabs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200">
          <EmptyState icon={Briefcase} title="No campaigns yet" description="Accept opportunities from brands to start collaborating." />
        </div>
      ) : (
        <div className="space-y-4">
          {collabs.map((cc) => {
            const campaign = getCampaign(cc.campaign_id);
            const post = getPost(cc.id);
            return (
              <div key={cc.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{campaign?.name || "Campaign"}</h3>
                    <p className="text-sm text-slate-500">{campaign?.company_name} · €{cc.price}</p>
                  </div>
                  <StatusBadge status={cc.status} />
                </div>

                {campaign?.objective && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{campaign.objective}</p>}

                {/* Brief summary */}
                {campaign && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs space-y-1">
                    {campaign.key_messages?.length > 0 && (
                      <p><span className="font-medium text-slate-700">Key messages:</span> {campaign.key_messages[0]}</p>
                    )}
                    {campaign.creator_guidelines && (
                      <p><span className="font-medium text-slate-700">Guidelines:</span> {campaign.creator_guidelines.slice(0, 100)}...</p>
                    )}
                    <p><span className="font-medium text-slate-700">Tracking link:</span> <span className="font-mono">{cc.tracking_link}</span></p>
                  </div>
                )}

                {/* Post status */}
                {post && (
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">Your submission</span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{post.content}</p>
                    {post.feedback && (
                      <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                        <span className="font-medium">Brand feedback:</span> {post.feedback}
                      </div>
                    )}
                    {post.post_url && (
                      <a href={post.post_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 mt-2">
                        <ExternalLink className="w-3 h-3" /> View live post
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  {cc.status === "accepted" && !post && (
                    <button onClick={() => setSubmitDraft(cc)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
                      <PenSquare className="w-4 h-4" /> Submit draft
                    </button>
                  )}
                  {(cc.status === "revision_requested") && (
                    <button onClick={() => { setSubmitDraft(cc); setDraftContent(post?.content || ""); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
                      <PenSquare className="w-4 h-4" /> Revise & resubmit
                    </button>
                  )}
                  {cc.tracking_link && (
                    <span className="text-xs text-slate-500 self-center ml-auto truncate">{cc.tracking_link}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit draft modal */}
      {submitDraft && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSubmitDraft(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900 mb-1">Submit your draft</h3>
            <p className="text-sm text-slate-500 mb-4">Write your LinkedIn post. The brand will review and approve before publishing.</p>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={8}
              placeholder="Write your LinkedIn post here..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setSubmitDraft(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button
                onClick={submitDraftPost}
                disabled={!draftContent.trim() || saving}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {saving ? "Submitting..." : "Submit for review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}