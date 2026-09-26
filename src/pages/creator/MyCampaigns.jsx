import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase, PenSquare, Loader2, Send, ExternalLink, AlertTriangle, RefreshCw, UserRound
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MyCampaigns() {
  const { user } = useAuth();
  const [collabs, setCollabs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitDraft, setSubmitDraft] = useState(null);
  const [draftContent, setDraftContent] = useState("");
  const [saving, setSaving] = useState(false);

  const creatorName = user?.full_name || "";

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      base44.entities.CampaignCreator.filter({ creator_name: creatorName }, "-created_date"),
      base44.entities.Post.filter({ creator_name: creatorName }, "-created_date"),
    ])
      .then(([cc, p]) => {
        setCollabs(cc || []);
        setPosts(p || []);
        // Get campaign details
        return Promise.all((cc || []).map((c) => base44.entities.Campaign.get(c.campaign_id).catch(() => null)));
      })
      .then(setCampaigns)
      .catch((err) => {
        console.error("MyCampaigns: load failed", err);
        setError("We couldn't load your campaigns. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [user, creatorName]);

  useEffect(() => {
    load();
  }, [load]);

  const getCampaign = (id) => campaigns.find((c) => c?.id === id);
  const getPost = (ccId) => posts.find((p) => p.campaign_creator_id === ccId);

  const submitDraftPost = async () => {
    setSaving(true);
    const cc = submitDraft;
    try {
      await base44.entities.Post.create({
        campaign_id: cc.campaign_id,
        campaign_creator_id: cc.id,
        creator_id: cc.creator_id,
        creator_name: cc.creator_name,
        content: draftContent,
        status: "submitted",
      });
      await base44.entities.CampaignCreator.update(cc.id, { status: "draft_submitted" });
      const updatedPosts = await base44.entities.Post.filter({ creator_name: creatorName }, "-created_date");
      setPosts(updatedPosts || []);
      const updatedCc = await base44.entities.CampaignCreator.filter({ creator_name: creatorName }, "-created_date");
      setCollabs(updatedCc || []);
      setSubmitDraft(null);
      setDraftContent("");
      toast({ title: "Draft submitted", description: "The brand will review it shortly." });
    } catch (err) {
      console.error("MyCampaigns: submit draft failed", err);
      toast({
        title: "We couldn't submit your draft",
        description: err.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your campaigns</span>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8" role="alert">
        <EmptyState
          icon={AlertTriangle}
          title="We couldn't load your campaigns"
          description={error}
          action={
            <Button onClick={load}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My campaigns"
        icon={Briefcase}
        description={`${collabs.length} ${collabs.length === 1 ? "collaboration" : "collaborations"}`}
      />

      {!user?.full_name ? (
        <div className="surface-card">
          <EmptyState
            icon={UserRound}
            title="Add your name to see your campaigns"
            description="Collaborations are matched to your profile name. Add it once and your deals show up here."
            action={
              <Button asChild>
                <Link to="/app/profile">Complete your profile</Link>
              </Button>
            }
          />
        </div>
      ) : collabs.length === 0 ? (
        <div className="surface-card">
            <EmptyState
              illustration="campaign"
              title="No campaigns yet"
            description="Accept opportunities from brands to start collaborating."
            action={
              <Button asChild>
                <Link to="/app/opportunities">Browse opportunities</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <Stagger as="ul" className="space-y-4" stagger={0.05}>
          {collabs.map((cc) => {
            const campaign = getCampaign(cc.campaign_id);
            const post = getPost(cc.id);
            return (
              <StaggerItem key={cc.id} as="li" className="surface-card p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold tracking-tight">{campaign?.name || "Campaign"}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {campaign?.company_name || "—"}
                      {cc.price ? ` · €${cc.price}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={cc.status} />
                </div>

                {campaign?.objective && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{campaign.objective}</p>
                )}

                {campaign && (
                  <div className="mb-3 space-y-1 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                    {campaign.key_messages?.length > 0 && (
                      <p>
                        <span className="font-semibold text-foreground">Key messages:</span>{" "}
                        {campaign.key_messages[0]}
                      </p>
                    )}
                    {campaign.creator_guidelines && (
                      <p>
                        <span className="font-semibold text-foreground">Guidelines:</span>{" "}
                        {campaign.creator_guidelines.slice(0, 100)}…
                      </p>
                    )}
                    {cc.tracking_link && (
                      <p className="break-all">
                        <span className="font-semibold text-foreground">Tracking link:</span>{" "}
                        <span className="font-mono">{cc.tracking_link}</span>
                      </p>
                    )}
                  </div>
                )}

                {post && (
                  <div className="mt-3 border-t border-border/70 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Your submission
                      </span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                    {post.feedback && (
                      <p className="mt-2 rounded-lg bg-warning/10 p-2 text-xs text-warning">
                        <span className="font-semibold">Brand feedback:</span> {post.feedback}
                      </p>
                    )}
                    {post.post_url && (
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                      >
                        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                        View live post
                        <span className="sr-only">from {campaign?.name || "this campaign"} (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                  {cc.status === "accepted" && !post && (
                    <Button size="sm" onClick={() => { setSubmitDraft(cc); setDraftContent(""); }}>
                      <PenSquare aria-hidden="true" className="h-4 w-4" />
                      Submit draft
                    </Button>
                  )}
                  {cc.status === "revision_requested" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSubmitDraft(cc);
                        setDraftContent(post?.content || "");
                      }}
                    >
                      <PenSquare aria-hidden="true" className="h-4 w-4" />
                      Revise &amp; resubmit
                    </Button>
                  )}
                    {cc.tracking_link && (
                      <span className="ml-auto hidden min-w-0 truncate font-mono text-xs text-muted-foreground sm:block">
                        {cc.tracking_link}
                      </span>
                    )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}

      <Dialog
        open={Boolean(submitDraft)}
        onOpenChange={(open) => {
          if (!open) {
            setSubmitDraft(null);
            setDraftContent("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {submitDraft?.status === "revision_requested" ? "Revise your draft" : "Submit your draft"}
            </DialogTitle>
            <DialogDescription>
              Write your LinkedIn post. The brand will review and approve before publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="draft-content">Post content</Label>
            <Textarea
              id="draft-content"
              rows={8}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Write your LinkedIn post here..."
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              onClick={submitDraftPost}
              disabled={!draftContent.trim() || saving}
            >
              {saving ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send aria-hidden="true" className="h-4 w-4" />
                  Submit for review
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitDraft(null);
                setDraftContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
