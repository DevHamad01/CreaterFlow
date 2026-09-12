import { useState } from "react";
import { reviewContentWithAI } from "@/lib/campaignAi";
import { Sparkles, Loader2, Check, X, AlertCircle, FileCheck, RefreshCw } from "lucide-react";

/**
 * AI Content Review Modal — Differentiator #6
 * 
 * AI-assisted review of creator draft content.
 * Checks campaign requirements, brand guidelines, key messages, CTA, tone, clarity.
 * Shows passed/needs_revision + suggestions.
 * The company still has final approval authority.
 * 
 * Props: post, campaign, onApprove, onReject
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">AI Content Review</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Draft content preview */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Draft from {post.creator_name}</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {post.content}
            </div>
          </div>

          {/* Run review button or results */}
          {!review && !loading && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-600 mb-4">
                Run AI review to check this draft against your campaign brief — key messages, CTA, tone, and clarity.
              </p>
              {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{error}</p>
                </div>
              )}
              <button
                onClick={runReview}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4" /> Run AI review
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
              <p className="text-sm text-slate-500">Analyzing draft against campaign requirements...</p>
            </div>
          )}

          {review && (
            <>
              {/* Summary */}
              <div className={`rounded-xl p-4 border ${review.status === "passed" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {review.status === "passed" ? (
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <h3 className={`font-semibold text-sm ${review.status === "passed" ? "text-emerald-900" : "text-amber-900"}`}>
                    {review.status === "passed" ? "Ready for approval" : "Needs revision"}
                  </h3>
                </div>
                <p className={`text-sm ${review.status === "passed" ? "text-emerald-700" : "text-amber-700"}`}>{review.summary}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-emerald-600 font-medium">{passed} passed</span>
                  <span className="text-amber-600 font-medium">{failed} need attention</span>
                </div>
              </div>

              {/* Detailed checks */}
              <div className="space-y-2">
                {review.checks?.map((check, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                    {check.passed ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-amber-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{check.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{check.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              {review.suggestions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Suggestions</h4>
                  <ul className="space-y-2">
                    {review.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-2" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-run review */}
              <button
                onClick={runReview}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <RefreshCw className="w-3 h-3" /> Re-run review
              </button>
            </>
          )}
        </div>

        {/* Footer with approval actions */}
        <div className="flex gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white">
            Review later
          </button>
          <button
            onClick={() => onReject(post)}
            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" /> Request revision
          </button>
          <button
            onClick={() => onApprove(post)}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}