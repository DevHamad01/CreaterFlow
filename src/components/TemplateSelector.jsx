import { useEffect, useState } from "react";
import { firestoreService } from "@/lib/firestore-service";
import { Save, FolderOpen, Trash2, FileText, X, Loader2, Plus } from "lucide-react";

export function TemplateSelector({ onApply, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CampaignTemplate.list("-created_date", 50)
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

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

  const deleteTemplate = async (id) => {
    await base44.entities.CampaignTemplate.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Choose a campaign template</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <FolderOpen className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No templates saved yet</p>
              <p className="text-xs text-slate-400 mt-1">Save your campaign settings as a template to reuse them later</p>
            </div>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => applyTemplate(tpl)}>
                  <p className="text-sm font-medium text-slate-900">{tpl.name}</p>
                  {tpl.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tpl.category && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tpl.category}</span>}
                    {tpl.budget > 0 && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">€{tpl.budget.toLocaleString()}</span>}
                    {tpl.lead_target > 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{tpl.lead_target} leads</span>}
                  </div>
                </div>
                <button onClick={() => deleteTemplate(tpl.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function SaveTemplateModal({ campaignData, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("lead_gen");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
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
      onClose();
    } catch (err) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Save as template</h3>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Template name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q1 Product Launch Template"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When to use this template..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="lead_gen">Lead Generation</option>
            <option value="awareness">Brand Awareness</option>
            <option value="product_launch">Product Launch</option>
            <option value="thought_leadership">Thought Leadership</option>
            <option value="retargeting">Retargeting</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={save} disabled={!name.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save template
          </button>
        </div>
      </div>
    </div>
  );
}