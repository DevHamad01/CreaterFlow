import { useState } from "react";
import { reviewContentWithAI } from "@/lib/campaignAi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Sparkles, Check, X, AlertCircle, FileCheck, RefreshCw, Loader2
} from "lucide-react";

/**
 * AI Content Review — Differentiator #6
 *
 * AI-assisted review of creator draft content.
 * Checks campaign requirements, brand guidelines, key messages, CTA, tone, clarity.
 * Shows passed/needs_revision + suggestions.
 * The company still has final approval authority.
 *
 * Props: post, campaign, onApprove, onReject, onClose
 */
export default function AIContentReview({ post, campaign, onApprove, onReject, onClose }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reviewContentWithAI(post.content, campaign);
      setReview(result);
    } catch (err) {
      setError(err.message || "Failed to run AI review. You can still review manually.");
    } finally {
      setLoading(false);
    }
  };

  const passed = review?.checks?.filter((c) => c.passed).length || 0;
  const failed = review?.checks?.filter((c) => !c.passed).length || 0;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-5 w-5 text-primary" />
            AI Content Review
          </DialogTitle>
          <DialogDescription className="sr-only">
            Automated checks of {post.creator_name}'s draft against the campaign brief.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Draft content preview */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Draft from {post.creator_name}
            </p>
            <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 text-sm">
              {post.content}
            </div>
          </div>

          {/* Run review button or results */}
          {!review && !loading && (
            <div className="py-6 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Run AI review to check this draft against your campaign brief — key messages, CTA,
                tone, and clarity.
              </p>
              {error && (
                <p
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-left"
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                  <span className="text-xs text-warning">{error}</span>
                </p>
              )}
              <Button onClick={runReview}>
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Run AI review
              </Button>
            </div>
          )}

          {loading && (
            <div className="space-y-3 py-4" aria-busy="true" aria-live="polite">
              <span className="sr-only">Analyzing draft against campaign requirements</span>
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
                Analyzing draft against campaign requirements…
              </p>
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          )}

          {review && (
            <>
              {/* Summary */}
              <div
                role="status"
                className={`rounded-xl border p-4 ${
                  review.status === "passed"
                    ? "border-success/25 bg-success/10"
                    : "border-warning/25 bg-warning/10"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {review.status === "passed" ? (
                    <FileCheck aria-hidden="true" className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle aria-hidden="true" className="h-5 w-5 text-warning" />
                  )}
                  <h3
                    className={`text-sm font-semibold ${
                      review.status === "passed" ? "text-success" : "text-warning"
                    }`}
                  >
                    {review.status === "passed" ? "Ready for approval" : "Needs revision"}
                  </h3>
                </div>
                <p className={`text-sm ${review.status === "passed" ? "text-success" : "text-warning"}`}>
                  {review.summary}
                </p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="font-medium text-success">{passed} passed</span>
                  <span className="font-medium text-warning">{failed} need attention</span>
                </div>
              </div>

              {/* Detailed checks */}
              <ul className="space-y-2">
                {review.checks?.map((check, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                        check.passed ? "bg-success/15" : "bg-warning/15"
                      }`}
                    >
                      {check.passed ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <X className="h-3 w-3 text-warning" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        <span className="sr-only">{check.passed ? "Passed: " : "Failed: "}</span>
                        {check.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{check.note}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Suggestions */}
              {review.suggestions?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Suggestions</h4>
                  <ul className="space-y-2">
                    {review.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-run review */}
              <Button variant="ghost" size="sm" onClick={runReview} disabled={loading}>
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                Re-run review
              </Button>
            </>
          )}
        </div>

        {/* Footer with approval actions */}
        <DialogFooter className="border-t border-border bg-muted/50 px-5 py-4 sm:flex-row sm:justify-stretch">
          <Button variant="outline" className="sm:flex-1" onClick={onClose}>
            Review later
          </Button>
          <Button
            className="border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15 hover:text-danger sm:flex-1"
            onClick={() => onReject(post)}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Request revision
          </Button>
          <Button
            className="bg-success text-success-foreground hover:bg-success/90 sm:flex-1"
            onClick={() => onApprove(post)}
          >
            <Check aria-hidden="true" className="h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
