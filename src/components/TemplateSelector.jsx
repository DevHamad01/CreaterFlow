import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, FolderOpen, Trash2, FileText, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "lead_gen", label: "Lead Generation" },
  { value: "awareness", label: "Brand Awareness" },
  { value: "product_launch", label: "Product Launch" },
  { value: "thought_leadership", label: "Thought Leadership" },
  { value: "retargeting", label: "Retargeting" },
];

export function TemplateSelector({ onApply, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    base44.entities.CampaignTemplate.list("-created_date", 50)
      .then((rows) => setTemplates(rows || []))
      .catch((err) => {
        console.error("TemplateSelector: load failed", err);
        setError("We couldn't load your templates. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyTemplate = (tpl) => {
    onApply({
      name: "",
      objective: tpl.objective || "",
      target_audience: tpl.target_audience || "",
      budget: tpl.budget || 0,
      key_messages: tpl.key_messages || [],
      creator_guidelines: tpl.creator_guidelines || "",
      content_direction: tpl.content_direction || "",
      product: tpl.product || "",
      desired_outcome: tpl.desired_outcome || "",
      tracking_base_url: tpl.tracking_base_url || "",
      lead_target: tpl.lead_target || 0,
    });
    onClose();
  };

  const deleteTemplate = async (tpl) => {
    setDeleting(tpl.id);
    const previous = templates;
    setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
    try {
      await base44.entities.CampaignTemplate.delete(tpl.id);
      toast({ title: "Template deleted", description: tpl.name });
    } catch (err) {
      console.error("TemplateSelector: delete failed", err);
      setTemplates(previous);
      toast({
        title: "We couldn't delete this template",
        description: err.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen aria-hidden="true" className="h-5 w-5 text-primary" />
            Choose a campaign template
          </DialogTitle>
          <DialogDescription>
            Applying a template fills the campaign form with your saved settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2 p-2" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading templates</span>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="px-4 py-10 text-center" role="alert">
              <AlertTriangle aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-warning" />
              <p className="text-sm text-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={load}>
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span
                aria-hidden="true"
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
              >
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">No templates saved yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Save your campaign settings as a template to reuse them later
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((tpl) => (
                <li
                  key={tpl.id}
                  className="group flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
                >
                  <button
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{tpl.name}</span>
                      {tpl.description && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                          {tpl.description}
                        </span>
                      )}
                      <span className="mt-2 flex flex-wrap gap-2">
                        {tpl.category && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {tpl.category}
                          </span>
                        )}
                        {tpl.budget > 0 && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                            €{tpl.budget.toLocaleString()}
                          </span>
                        )}
                        {tpl.lead_target > 0 && (
                          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                            {tpl.lead_target} leads
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(tpl)}
                    disabled={deleting === tpl.id}
                    aria-label={`Delete template ${tpl.name}`}
                    className="flex-shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    {deleting === tpl.id ? (
                      <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SaveTemplateModal({ campaignData, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("lead_gen");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const uid = useId();

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await base44.entities.CampaignTemplate.create({
        name: name.trim(),
        description: description.trim(),
        objective: campaignData.objective || "",
        target_audience: campaignData.target_audience || "",
        budget: campaignData.budget || 0,
        key_messages: campaignData.key_messages || [],
        creator_guidelines: campaignData.creator_guidelines || "",
        content_direction: campaignData.content_direction || "",
        product: campaignData.product || "",
        desired_outcome: campaignData.desired_outcome || "",
        tracking_base_url: campaignData.tracking_base_url || "",
        lead_target: campaignData.lead_target || 0,
        category,
      });
      toast({ title: "Template saved", description: name.trim() });
      onClose();
    } catch (err) {
      console.error("SaveTemplateModal: save failed", err);
      setError(err.message || "We couldn't save this template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save aria-hidden="true" className="h-5 w-5 text-primary" />
            Save as template
          </DialogTitle>
          <DialogDescription>
            Save the current campaign settings so you can reuse them for the next one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-name`}>Template name</Label>
            <Input
              id={`${uid}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Product Launch Template"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-description`}>Description (optional)</Label>
            <Input
              id={`${uid}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this template..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-category`}>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id={`${uid}-category`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim() || saving}>
            {saving ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="h-4 w-4" />
                Save template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
