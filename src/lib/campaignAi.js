/**
 * Campaign AI Copilot & Content Review
 * 
 * AI-powered campaign strategy generation, content review, 
 * creator-specific content angles, and post-campaign reporting.
 * 
 * Uses Google Generative AI (Gemini) with JSON output.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper to parse JSON from AI response
async function generateJSON(prompt, jsonSchema) {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

// ============================================================
// AI CAMPAIGN COPILOT — Differentiator #1
// ============================================================

/**
 * Generate a full campaign strategy using AI.
 * Behaves like a campaign strategist, not just a text generator.
 */
export async function generateCampaignStrategy(formData) {
  const prompt = `You are a senior B2B creator marketing strategist. A company wants to launch a LinkedIn creator campaign. Generate a comprehensive campaign strategy in JSON format.

Company/Product Details:
- Product or service: ${formData.product}
- Website: ${formData.website || "Not provided"}
- Industry: ${formData.industry || "Not provided"}
- Ideal customer profile (ICP): ${formData.target_audience}
- Campaign objective: ${formData.objective}
- Geography: ${formData.geography || "Global"}
- Budget: €${formData.budget}
- Desired outcome: ${formData.desired_outcome}
- Key message: ${formData.keyMessage || "Not specified"}

Generate a structured campaign strategy as JSON with this exact structure:
{
  "strategy": {
    "objective": "refined campaign objective (1 sentence)",
    "target_audience": "refined ICP description",
    "positioning": "how the product should be positioned to this audience",
    "campaign_type": "recommended campaign type (e.g., Product launch, Thought leadership, Lead gen, Brand awareness)",
    "estimated_duration": "recommended campaign duration (e.g., 3-4 weeks)"
  },
  "creator_requirements": {
    "recommended_niches": ["niche1", "niche2", "niche3"],
    "audience_characteristics": "what the creator's audience should look like",
    "geography": "recommended creator geography",
    "experience_level": "emerging | established | expert",
    "creator_size": "recommended follower range (e.g., 10K-50K)",
    "estimated_creators": number
  },
  "campaign": {
    "campaign_name": "catchy campaign name",
    "brief": "2-3 paragraph campaign brief for creators",
    "key_messages": ["message1", "message2", "message3"],
    "creator_guidelines": "detailed guidelines (tone, format, what to include/avoid)",
    "content_direction": "creative content direction and suggestions",
    "cta": "recommended call-to-action for posts"
  },
  "measurement": {
    "tracking_strategy": "how to track and attribute results",
    "recommended_kpis": ["kpi1", "kpi2", "kpi3"],
    "attribution_approach": "how to measure ROI"
  }
}

Make everything specific, practical, and actionable for B2B LinkedIn content. Be concise but thorough. Return ONLY valid JSON.`;

  return await generateJSON(prompt);
}

// ============================================================
// AI CONTENT REVIEW — Differentiator #6
// ============================================================

/**
 * AI-assisted review of creator draft content.
 * Checks against campaign requirements, brand guidelines, key messages.
 */
export async function reviewContentWithAI(postContent, campaign) {
  const prompt = `You are a B2B content reviewer for a LinkedIn creator campaign. Review the creator's draft post against the campaign brief.

Campaign brief:
- Objective: ${campaign?.objective || "Not specified"}
- Target audience: ${campaign?.target_audience || "Not specified"}
- Key messages: ${JSON.stringify(campaign?.key_messages || [])}
- Creator guidelines: ${campaign?.creator_guidelines || "Not specified"}
- Content direction: ${campaign?.content_direction || "Not specified"}
- Desired outcome: ${campaign?.desired_outcome || "Not specified"}

Creator's draft post:
"""
${postContent}
"""

Review the draft and provide a structured assessment as JSON:
{
  "status": "passed" or "needs_revision",
  "checks": [
    {
      "name": "check name (e.g., Key message inclusion)",
      "passed": true/false,
      "note": "brief explanation"
    }
  ],
  "suggestions": ["suggestion1", "suggestion2"],
  "summary": "1-2 sentence overall assessment"
}

Be strict but constructive. Check for key messages, CTA, tone alignment, and no misleading claims. Return ONLY valid JSON.`;

  return await generateJSON(prompt);
}

// ============================================================
// CREATOR-SPECIFIC CONTENT ANGLES
// ============================================================

/**
 * Generate creator-specific content angle suggestions.
 */
export async function generateCreatorContentAngles(creators, campaign) {
  const creatorDescriptions = creators.map(c => `- ${c.name} (niche: ${c.niche}, followers: ${c.followers})`).join("\n");

  const prompt = `You are a B2B content strategist. For each creator, suggest a unique content angle that fits their niche and audience.

Campaign: ${campaign?.campaign_name || "New campaign"}
Product: ${campaign?.product || "Not specified"}
Objective: ${campaign?.objective || "Not specified"}

Creators:
${creatorDescriptions}

Generate JSON with unique content angles for each creator:
{
  "angles": [
    {
      "creator_name": "name",
      "angle": "unique content angle specific to this creator",
      "talking_points": ["point1", "point2"]
    }
  ]
}

Return ONLY valid JSON. Each creator should get a different, personalized angle.`;

  return await generateJSON(prompt);
}

// ============================================================
// POST-CAMPAIGN PERFORMANCE INSIGHTS
// ============================================================

/**
 * Generate AI-powered post-campaign insights and recommendations.
 */
export async function generateCampaignInsights(campaignData, metrics) {
  const prompt = `You are a B2B marketing analyst. Analyze the performance of a creator campaign and provide insights.

Campaign: ${campaignData?.campaign_name || "Campaign"}
Duration: ${campaignData?.duration || "Not specified"}
Budget: €${campaignData?.budget || "Not specified"}

Performance Metrics:
- Total impressions: ${metrics?.total_impressions || 0}
- Total engagements: ${metrics?.total_engagements || 0}
- Total leads generated: ${metrics?.total_leads || 0}
- Average engagement rate: ${metrics?.avg_engagement_rate || 0}%

Provide insights as JSON:
{
  "performance_summary": "overall campaign performance assessment",
  "top_performers": ["creator1", "creator2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "roi_analysis": "ROI analysis and cost per lead"
}

Return ONLY valid JSON.`;

  return await generateJSON(prompt);
}

// ============================================================
// AI CAMPAIGN COPILOT — Differentiator #1
// ============================================================

/**
 * Generate a full campaign strategy using AI.
 * Behaves like a campaign strategist, not just a text generator.
 * 
 * Input: product, website, industry, ICP, objective, geography, budget, outcome, keyMessage
 * Output: strategy, creator requirements, campaign brief, measurement plan
 */
export async function generateCampaignStrategy(formData) {
  const prompt = `You are a senior B2B creator marketing strategist. A company wants to launch a LinkedIn creator campaign. Generate a comprehensive campaign strategy.

Company/Product Details:
- Product or service: ${formData.product}
- Website: ${formData.website || "Not provided"}
- Industry: ${formData.industry || "Not provided"}
- Ideal customer profile (ICP): ${formData.target_audience}
- Campaign objective: ${formData.objective}
- Geography: ${formData.geography || "Global"}
- Budget: €${formData.budget}
- Desired outcome: ${formData.desired_outcome}
- Key message: ${formData.keyMessage || "Not specified"}

Generate a structured campaign strategy as JSON with these sections:

1. strategy:
   - objective: refined campaign objective (1 sentence)
   - target_audience: refined ICP description
   - positioning: how the product should be positioned to this audience
   - campaign_type: recommended campaign type (e.g., "Product launch", "Thought leadership", "Lead gen", "Brand awareness")
   - estimated_duration: recommended campaign duration (e.g., "3-4 weeks")

2. creator_requirements:
   - recommended_niches: array of 2-3 niches that best fit this campaign
   - audience_characteristics: what the creator's audience should look like
   - geography: recommended creator geography
   - experience_level: "emerging" | "established" | "expert"
   - creator_size: recommended follower range (e.g., "10K-50K")
   - estimated_creators: how many creators to activate for this budget

3. campaign:
   - campaign_name: catchy campaign name
   - brief: 2-3 paragraph campaign brief for creators
   - key_messages: array of 3-4 compelling key messages
   - creator_guidelines: detailed guidelines (tone, format, what to include/avoid)
   - content_direction: creative content direction and suggestions
   - cta: recommended call-to-action for posts

4. measurement:
   - tracking_strategy: how to track and attribute results
   - recommended_kpis: array of 3-4 KPIs to track
   - attribution_approach: how to measure ROI

Make everything specific, practical, and actionable for B2B LinkedIn content. Be concise but thorough.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        strategy: {
          type: "object",
          properties: {
            objective: { type: "string" },
            target_audience: { type: "string" },
            positioning: { type: "string" },
            campaign_type: { type: "string" },
            estimated_duration: { type: "string" },
          },
        },
        creator_requirements: {
          type: "object",
          properties: {
            recommended_niches: { type: "array", items: { type: "string" } },
            audience_characteristics: { type: "string" },
            geography: { type: "string" },
            experience_level: { type: "string" },
            creator_size: { type: "string" },
            estimated_creators: { type: "number" },
          },
        },
        campaign: {
          type: "object",
          properties: {
            campaign_name: { type: "string" },
            brief: { type: "string" },
            key_messages: { type: "array", items: { type: "string" } },
            creator_guidelines: { type: "string" },
            content_direction: { type: "string" },
            cta: { type: "string" },
          },
        },
        measurement: {
          type: "object",
          properties: {
            tracking_strategy: { type: "string" },
            recommended_kpis: { type: "array", items: { type: "string" } },
            attribution_approach: { type: "string" },
          },
        },
      },
    },
  });

  return result;
}

// ============================================================
// AI CONTENT REVIEW — Differentiator #6
// ============================================================

/**
 * AI-assisted review of creator draft content.
 * Checks against campaign requirements, brand guidelines, key messages.
 * 
 * Returns: { status, checks, suggestions, summary }
 * status: "passed" | "needs_revision"
 * The company still has final approval authority.
 */
export async function reviewContentWithAI(postContent, campaign) {
  const prompt = `You are a B2B content reviewer for a LinkedIn creator campaign. Review the creator's draft post against the campaign brief.

Campaign brief:
- Objective: ${campaign?.objective || "Not specified"}
- Target audience: ${campaign?.target_audience || "Not specified"}
- Key messages: ${JSON.stringify(campaign?.key_messages || [])}
- Creator guidelines: ${campaign?.creator_guidelines || "Not specified"}
- Content direction: ${campaign?.content_direction || "Not specified"}
- Desired outcome: ${campaign?.desired_outcome || "Not specified"}

Creator's draft post:
"""
${postContent}
"""

Review the draft and provide a structured assessment as JSON:

1. status: "passed" if the post is ready for approval, "needs_revision" if changes are needed
2. checks: array of check objects, each with:
   - name: the check name (e.g., "Key message inclusion", "CTA present", "Tone alignment", "Clarity", "No misleading claims")
   - passed: boolean
   - note: brief explanation
3. suggestions: array of specific, actionable improvement suggestions (strings)
4. summary: 1-2 sentence overall assessment

Be strict but constructive. Check that key messages are conveyed, a clear CTA exists, the tone matches B2B professional standards, and there are no misleading claims or forbidden terms (like "guaranteed", "100%", "best in the world").`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        checks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              passed: { type: "boolean" },
              note: { type: "string" },
            },
          },
        },
        suggestions: { type: "array", items: { type: "string" } },
        summary: { type: "string" },
      },
    },
  });

  return result;
}

// ============================================================
// CREATOR-SPECIFIC CONTENT ANGLES — Differentiator #7
// ============================================================

/**
 * Generate creator-specific content angle suggestions.
 * Different creators get different angles based on their niche, audience, and expertise.
 */
export async function generateCreatorContentAngles(creators, campaign) {
  const prompt = `You are a B2B content strategist. For each creator in a LinkedIn campaign, suggest a unique content angle that fits their niche, audience, and expertise. Do NOT give every creator identical instructions.

Campaign:
- Product: ${campaign?.product || "Not specified"}
- Objective: ${campaign?.objective || "Not specified"}
- Target audience: ${campaign?.target_audience || "Not specified"}
- Key messages: ${JSON.stringify(campaign?.key_messages || [])}

Creators to generate angles for:
${creators.map((c, i) => `${i + 1}. ${c.name} — Niche: ${c.niche}, Audience: ${c.audience_type || "Not specified"}, Headline: ${c.headline || "Not specified"}`).join("\n")}

For each creator, provide a JSON object with:
- creator_name: the creator's name
- angle_name: a short label for the angle (e.g., "Founder story angle", "Technical breakdown angle", "Practical workflow angle")
- angle_description: 2-3 sentences describing the specific content approach for this creator
- suggested_hook: an opening hook tailored to their style
- key_talking_points: array of 2-3 specific points this creator should cover

Return as a JSON object with "angles" array.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        angles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              creator_name: { type: "string" },
              angle_name: { type: "string" },
              angle_description: { type: "string" },
              suggested_hook: { type: "string" },
              key_talking_points: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  });

  return result;
}

// ============================================================
// POST-CAMPAIGN AI REPORT — Differentiator #11
// ============================================================

/**
 * Generate an executive summary report for a completed campaign.
 * Client-ready format with insights and recommendations.
 */
export async function generateCampaignReport(campaign, creators, posts, metrics, leads, payments) {
  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0";
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : "0";

  // Find best creator by leads
  const creatorPerf = creators.map((cc) => {
    const cm = metrics.filter((m) => m.creator_id === cc.creator_id);
    return {
      name: cc.creator_name,
      impressions: cm.reduce((s, m) => s + (m.impressions || 0), 0),
      clicks: cm.reduce((s, m) => s + (m.clicks || 0), 0),
      leads: cm.reduce((s, m) => s + (m.leads || 0), 0),
    };
  });
  const bestCreator = creatorPerf.sort((a, b) => b.leads - a.leads)[0];

  const prompt = `You are a campaign analyst. Generate an executive summary report for a completed B2B LinkedIn creator campaign. This report should be professional and client-ready.

Campaign details:
- Name: ${campaign?.name}
- Objective: ${campaign?.objective}
- Budget: €${campaign?.budget?.toLocaleString() || 0}
- Product: ${campaign?.product || "Not specified"}

Results:
- Total spend: €${totalSpend.toLocaleString()}
- Creators activated: ${creators.length}
- Posts published: ${posts.filter((p) => p.status === "live").length}
- Impressions: ${totalImpressions.toLocaleString()}
- Clicks: ${totalClicks.toLocaleString()}
- Leads: ${totalLeads}
- Conversion rate: ${conversionRate}%
- Cost per lead: €${cpl}
- Pipeline value: €${totalPipeline.toLocaleString()}
- Best performing creator: ${bestCreator?.name || "N/A"} (${bestCreator?.leads || 0} leads)

Generate a structured report as JSON:
- executive_summary: 2-3 sentence overview of campaign performance
- key_results: array of 3-4 key result highlights (strings)
- best_performing_content: description of what made the best content work
- weakest_area: honest assessment of the weakest aspect of the campaign
- key_insights: array of 2-3 analytical insights (strings)
- recommendations: array of 3-4 actionable recommendations for the next campaign (strings)
- next_campaign_suggestions: 2-3 specific suggestions for future campaigns`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        key_results: { type: "array", items: { type: "string" } },
        best_performing_content: { type: "string" },
        weakest_area: { type: "string" },
        key_insights: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        next_campaign_suggestions: { type: "array", items: { type: "string" } },
      },
    },
  });

  return result;
}

// ============================================================
// CREATOR GROWTH INTELLIGENCE — Differentiator #12
// ============================================================

/**
 * Generate insights for a creator's growth intelligence dashboard.
 * Analyzes their best-performing topics, campaigns, and trends.
 */
export async function generateCreatorInsights(creator, posts, campaignCreators, metrics) {
  const prompt = `You are a creator analytics assistant. Analyze a B2B LinkedIn creator's performance and provide growth insights.

Creator profile:
- Name: ${creator?.name}
- Niche: ${creator?.niche}
- Followers: ${creator?.linkedin_followers?.toLocaleString() || 0}
- Engagement rate: ${creator?.engagement_rate || 0}%
- Average impressions per post: ${creator?.avg_impressions?.toLocaleString() || 0}
- Average clicks per post: ${creator?.avg_clicks?.toLocaleString() || 0}
- Average leads per post: ${creator?.avg_leads?.toLocaleString() || 0}
- Total campaigns: ${creator?.total_campaigns || 0}

Recent performance data:
- Active collaborations: ${campaignCreators.length}
- Posts submitted: ${posts.length}
- Posts live: ${posts.filter((p) => p.status === "live").length}
- Total metrics recorded: ${metrics.length}

Generate growth insights as JSON:
- best_topics: array of 2-3 topics that likely perform best for this creator based on their niche
- engagement_trend: 1 sentence on their engagement trajectory
- content_tip: 1 specific actionable tip to improve their content performance
- positioning_tip: 1 suggestion on how to position themselves for better brand deals
- earnings_opportunity: 1 sentence on an earnings opportunity they might be missing`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        best_topics: { type: "array", items: { type: "string" } },
        engagement_trend: { type: "string" },
        content_tip: { type: "string" },
        positioning_tip: { type: "string" },
        earnings_opportunity: { type: "string" },
      },
    },
  });

  return result;
}