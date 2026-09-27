/**
 * Campaign AI Copilot & Content Review
 *
 * AI-powered campaign strategy generation, content review, creator-specific
 * content angles, and post-campaign reporting.
 *
 * ── Why this talks to the REST API instead of an SDK ────────────────────────
 * This file used to use `@google/generative-ai` with `model: "gemini-pro"`.
 * That model is retired: the endpoint returns 404
 * ("models/gemini-pro is not found for API version v1beta"), so every AI
 * feature in the product was failing. `@google/generative-ai` is also
 * end-of-life and cannot resolve current model names.
 *
 * The REST endpoint is used directly for three reasons:
 *   1. It is the only surface that can address the models this project can
 *      actually reach. `gemini-2.5-flash` is closed to new projects, and
 *      `gemini-flash-latest` resolves to `gemini-3.8-flash`, so the model has
 *      to be configurable rather than baked in.
 *   2. `responseMimeType: "application/json"` + `responseSchema` makes the
 *      model emit schema-valid JSON. The old code scraped JSON out of prose
 *      with /\{[\s\S]*\}/, which breaks on a brace inside a string and cannot
 *      recover from a truncated response.
 *   3. It removes an abandoned dependency, so there is no stale SDK to keep
 *      in step with model renames.
 *
 * ── Why the client is created lazily ────────────────────────────────────────
 * The old code built the client at module scope. A missing key therefore threw
 * while the module graph was still loading and took the importing page down
 * with it. Here the endpoint is resolved per call, and a missing key produces
 * a thrown Error with an actionable message at the point of use.
 */

// Gemini 3.x is a thinking model: it spends output tokens on reasoning before
// writing any text. A small maxOutputTokens therefore returns a 200 with an
// EMPTY content array and finishReason MAX_TOKENS, which looks like a silent
// failure rather than a limit. Keep this comfortably above the thinking
// budget plus the longest JSON payload this file asks for.
const MAX_OUTPUT_TOKENS = 8192;

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';

const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const isGeminiConfigured = Boolean(API_KEY);

export const NOT_CONFIGURED_ERROR =
  'Gemini is not configured. Add VITE_GEMINI_API_KEY and VITE_GEMINI_MODEL to .env.local, then run `npm run doctor` and restart the dev server.';

const JSON_HINT =
  'Respond with JSON only. Do not wrap the JSON in markdown fences and do not add commentary before or after it.';

// Gemini's flash tier intermittently answers 429/503 under load ("This model is
// currently experiencing high demand"). Those are transient, so a single failed
// request should not surface as a failed AI button to the user. Configuration
// errors (400/401/403/404) are deliberately NOT retried, because repeating them
// only burns quota and delays the real message.
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 1200;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Error carrying the HTTP status and the API's own message.
 *
 * `retryAfterMs` is set by the request layer when a retryable response carried
 * the server's own backoff hint, so the retry loop honours it.
 */
export class GeminiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, cause?: unknown }} [options]
   */
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'GeminiError';
    /** @type {number | undefined} */
    this.status = status;
    /** @type {number | undefined} */
    this.retryAfterMs = undefined;
    if (cause) this.cause = cause;
  }
}

/**
 * Pull a human-usable explanation out of a Google API error body. The shapes
 * differ per endpoint, so this handles the two that actually occur: the
 * standard {error:{message}} envelope and a bare {message}.
 */
function describeApiError(payload, status) {
  const message = payload?.error?.message || payload?.message;
  if (!message) return `Gemini request failed with HTTP ${status}.`;

  if (status === 404) {
    return `${message} The configured model "${MODEL}" is not available to this project. Set VITE_GEMINI_MODEL in .env.local to a model from \`npm run doctor\`.`;
  }
  if (status === 400 && /API key not valid/i.test(message)) {
    return 'Gemini rejected the API key. Check VITE_GEMINI_API_KEY in .env.local.';
  }
  if (status === 403) {
    return `${message} The key is likely missing the Generative Language API restriction, or referrer-restricted to a different origin.`;
  }
  if (status === 429) {
    return 'Gemini rate limit or quota exhausted. Check the key in Google Cloud Console > Quotas.';
  }
  return message;
}

/**
 * One request/response cycle. Throws GeminiError on any non-retryable problem.
 */
/**
 * One request/response cycle. Throws GeminiError on any non-retryable problem.
 *
 * @param {string} prompt
 * @param {{ schema?: object, temperature: number, maxOutputTokens: number, model: string }} options
 * @returns {Promise<string>}
 */
async function requestOnce(prompt, { schema, temperature, maxOutputTokens, model }) {
  const generationConfig = {
    temperature,
    maxOutputTokens,
    ...(schema ? { responseMimeType: 'application/json', responseSchema: schema } : {}),
  };

  const response = await fetch(`${API_ROOT}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });

  const raw = await response.text();
  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new GeminiError(
      `Gemini returned a non-JSON response (HTTP ${response.status}).`,
      { status: response.status }
    );
  }

  if (!response.ok) {
    const error = new GeminiError(describeApiError(payload, response.status), { status: response.status });
    // Honour the server's own retry hint when it sends one.
    const hint = Number(payload?.error?.details?.find?.((d) => d.retryDelay)?.retryDelay?.replace('s', ''));
    if (RETRYABLE_STATUS.has(response.status) && Number.isFinite(hint) && hint > 0) {
      error.retryAfterMs = Math.min(hint * 1000, 30_000);
    }
    throw error;
  }

  const candidate = payload?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';

  if (!text) {
    // Almost always a thinking model exhausting its output budget, or a
    // content-safety block. Say which, because "no output" is otherwise opaque.
    const reason = candidate?.finishReason;
    throw new GeminiError(
      reason === 'MAX_TOKENS'
        ? `Gemini used its entire ${maxOutputTokens}-token budget on reasoning and returned no content. Raise the maxOutputTokens for this call.`
        : reason === 'SAFETY'
          ? 'Gemini blocked this request for safety reasons. Rephrase the campaign brief and try again.'
          : `Gemini returned no content (finishReason: ${reason || 'unknown'}).`,
      { status: response.status }
    );
  }

  return text;
}

/**
 * Call the model and return the first text part, retrying transient failures.
 *
 * @param {string} prompt
 * @param {object} [options]
 * @param {object} [options.schema]      JSON schema; when present the model is
 *   constrained to emit matching JSON and no prose.
 * @param {string} [options.model]       Overrides VITE_GEMINI_MODEL.
 * @param {number} [options.temperature]
 * @param {number} [options.maxOutputTokens]
 * @returns {Promise<string>}
 */
export async function generateText(prompt, options = {}) {
  if (!API_KEY) throw new GeminiError(NOT_CONFIGURED_ERROR);

  const { temperature = 0.4, maxOutputTokens = MAX_OUTPUT_TOKENS, model = MODEL } = options;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await requestOnce(prompt, { ...options, temperature, maxOutputTokens, model });
    } catch (err) {
      lastError = err;
      const canRetry = RETRYABLE_STATUS.has(err.status) && attempt < MAX_ATTEMPTS;
      if (!canRetry) throw err;
      // Exponential backoff, or the server's hint when it supplied one.
      const wait = err.retryAfterMs || RETRY_BASE_MS * 2 ** (attempt - 1);
      await sleep(wait);
    }
  }

  throw lastError;
}

/**
 * Call the model and parse the result.
 *
 * When a schema is supplied the response is schema-valid JSON and is parsed
 * directly. Without one, the model is only *asked* for JSON, so the reply can
 * still arrive fenced or with prose around it -- hence the fallback.
 */
export async function generateJSON(prompt, schema) {
  const text = await generateText(schema ? prompt : `${prompt}\n\n${JSON_HINT}`, { schema });

  try {
    return JSON.parse(text);
  } catch {
    // Tolerate a fenced block or surrounding prose.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fenced ? fenced[1] : text.match(/\{[\s\S]*\}/)?.[0];
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch {
        /* fall through to the error below */
      }
    }
    throw new GeminiError('Gemini did not return parseable JSON for this request.');
  }
}

// Reusable schema fragments. Declaring the shape server-side is what lets the
// model guarantee the keys the UI reads, instead of the UI defending against
// whatever prose came back.
const stringArray = { type: 'array', items: { type: 'string' } };
const str = { type: 'string' };

// ============================================================
// AI CAMPAIGN COPILOT — Differentiator #1
// ============================================================

const CAMPAIGN_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    strategy: {
      type: 'object',
      properties: {
        objective: str,
        target_audience: str,
        positioning: str,
        campaign_type: str,
        estimated_duration: str,
      },
      required: ['objective', 'target_audience', 'positioning', 'campaign_type', 'estimated_duration'],
    },
    creator_requirements: {
      type: 'object',
      properties: {
        recommended_niches: stringArray,
        audience_characteristics: str,
        geography: str,
        experience_level: str,
        creator_size: str,
        estimated_creators: { type: 'integer' },
      },
      required: ['recommended_niches', 'audience_characteristics', 'geography', 'experience_level', 'creator_size', 'estimated_creators'],
    },
    campaign: {
      type: 'object',
      properties: {
        campaign_name: str,
        brief: str,
        key_messages: stringArray,
        creator_guidelines: str,
        content_direction: str,
        cta: str,
      },
      required: ['campaign_name', 'brief', 'key_messages', 'creator_guidelines', 'content_direction', 'cta'],
    },
    measurement: {
      type: 'object',
      properties: {
        tracking_strategy: str,
        recommended_kpis: stringArray,
        attribution_approach: str,
      },
      required: ['tracking_strategy', 'recommended_kpis', 'attribution_approach'],
    },
  },
  required: ['strategy', 'creator_requirements', 'campaign', 'measurement'],
};

/**
 * Generate a full campaign strategy using AI.
 * Behaves like a campaign strategist, not just a text generator.
 */
export async function generateCampaignStrategy(formData) {
  const prompt = `You are a senior B2B creator marketing strategist. A company wants to launch a LinkedIn creator campaign. Generate a comprehensive campaign strategy in JSON format.

Company/Product Details:
- Product or service: ${formData.product}
- Website: ${formData.website || 'Not provided'}
- Industry: ${formData.industry || 'Not provided'}
- Ideal customer profile (ICP): ${formData.target_audience}
- Campaign objective: ${formData.objective}
- Geography: ${formData.geography || 'Global'}
- Budget: EUR ${formData.budget}
- Desired outcome: ${formData.desired_outcome}
- Key message: ${formData.keyMessage || 'Not specified'}

Make everything specific, practical, and actionable for B2B LinkedIn content. Be concise but thorough.`;

  return generateJSON(prompt, CAMPAIGN_STRATEGY_SCHEMA);
}

// ============================================================
// AI CONTENT REVIEW — Differentiator #6
// ============================================================

const CONTENT_REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['passed', 'needs_revision'] },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: str, passed: { type: 'boolean' }, note: str },
        required: ['name', 'passed', 'note'],
      },
    },
    suggestions: stringArray,
    summary: str,
  },
  required: ['status', 'checks', 'suggestions', 'summary'],
};

/**
 * AI-assisted review of creator draft content.
 * Checks against campaign requirements, brand guidelines, key messages.
 *
 * The company still has final approval authority.
 */
export async function reviewContentWithAI(postContent, campaign) {
  const prompt = `You are a B2B content reviewer for a LinkedIn creator campaign. Review the creator's draft post against the campaign brief.

Campaign brief:
- Objective: ${campaign?.objective || 'Not specified'}
- Target audience: ${campaign?.target_audience || 'Not specified'}
- Key messages: ${JSON.stringify(campaign?.key_messages || [])}
- Creator guidelines: ${campaign?.creator_guidelines || 'Not specified'}
- Content direction: ${campaign?.content_direction || 'Not specified'}
- Desired outcome: ${campaign?.desired_outcome || 'Not specified'}

Creator's draft post:
"""
${postContent}
"""

Be strict but constructive. Check for key messages, CTA, tone alignment, and no misleading claims.`;

  return generateJSON(prompt, CONTENT_REVIEW_SCHEMA);
}

// ============================================================
// CREATOR-SPECIFIC CONTENT ANGLES — Differentiator #7
// ============================================================

const CONTENT_ANGLES_SCHEMA = {
  type: 'object',
  properties: {
    angles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          creator_name: str,
          angle_name: str,
          angle_description: str,
          suggested_hook: str,
          key_talking_points: stringArray,
        },
        required: ['creator_name', 'angle_name', 'angle_description', 'suggested_hook', 'key_talking_points'],
      },
    },
  },
  required: ['angles'],
};

/**
 * Generate creator-specific content angle suggestions.
 * Different creators get different angles based on their niche, audience, and expertise.
 */
export async function generateCreatorContentAngles(creators, campaign) {
  // `creators` are CampaignCreator rows, so the available fields are
  // creator_name / creator_niche / creator_followers. The richer Creator
  // fields (headline, audience_type) live on the Creator entity and are not
  // part of this payload, so they are deliberately not referenced here.
  const creatorDescriptions = creators
    .map(
      (c, i) =>
        `${i + 1}. ${c.creator_name || `Creator ${i + 1}`} — Niche: ${c.creator_niche || 'Not specified'}, LinkedIn followers: ${
          c.creator_followers?.toLocaleString() || 'Not specified'
        }`
    )
    .join('\n');

  const prompt = `You are a B2B content strategist. For each creator in a LinkedIn campaign, suggest a unique content angle that fits their niche, audience, and expertise. Do NOT give every creator identical instructions.

Campaign:
- Product: ${campaign?.product || 'Not specified'}
- Objective: ${campaign?.objective || 'Not specified'}
- Target audience: ${campaign?.target_audience || 'Not specified'}
- Key messages: ${JSON.stringify(campaign?.key_messages || [])}

Creators to generate angles for:
${creatorDescriptions}

Each creator must get a different, personalised angle.`;

  return generateJSON(prompt, CONTENT_ANGLES_SCHEMA);
}

// ============================================================
// POST-CAMPAIGN PERFORMANCE INSIGHTS
// ============================================================

const CAMPAIGN_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    performance_summary: str,
    top_performers: stringArray,
    recommendations: stringArray,
    roi_analysis: str,
  },
  required: ['performance_summary', 'top_performers', 'recommendations', 'roi_analysis'],
};

/**
 * Generate AI-powered post-campaign insights and recommendations.
 */
export async function generateCampaignInsights(campaignData, metrics) {
  const prompt = `You are a B2B marketing analyst. Analyze the performance of a creator campaign and provide insights.

Campaign: ${campaignData?.campaign_name || 'Campaign'}
Duration: ${campaignData?.duration || 'Not specified'}
Budget: EUR ${campaignData?.budget || 'Not specified'}

Performance Metrics:
- Total impressions: ${metrics?.total_impressions || 0}
- Total engagements: ${metrics?.total_engagements || 0}
- Total leads generated: ${metrics?.total_leads || 0}
- Average engagement rate: ${metrics?.avg_engagement_rate || 0}%`;

  return generateJSON(prompt, CAMPAIGN_INSIGHTS_SCHEMA);
}

// ============================================================
// POST-CAMPAIGN AI REPORT — Differentiator #11
// ============================================================

const CAMPAIGN_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    executive_summary: str,
    key_results: stringArray,
    best_performing_content: str,
    weakest_area: str,
    key_insights: stringArray,
    recommendations: stringArray,
    next_campaign_suggestions: stringArray,
  },
  required: [
    'executive_summary',
    'key_results',
    'best_performing_content',
    'weakest_area',
    'key_insights',
    'recommendations',
    'next_campaign_suggestions',
  ],
};

/**
 * Generate an executive summary report for a completed campaign.
 * Client-ready format with insights and recommendations.
 */
export async function generateCampaignReport(campaign, creators, posts, metrics, leads, payments) {
  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalLeads = leads.length;
  const totalPipeline = leads.reduce((s, l) => s + (l.value || 0), 0);
  const totalSpend = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const cpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : '0';
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : '0';

  // Best creator by leads. `metrics` is narrowed per creator via creator_id, and
  // the sort must not mutate the caller's array.
  const creatorPerf = creators
    .map((cc) => {
      const cm = metrics.filter((m) => m.creator_id === cc.creator_id);
      return {
        name: cc.creator_name,
        leads: cm.reduce((s, m) => s + (m.leads || 0), 0),
      };
    })
    .sort((a, b) => b.leads - a.leads);
  const bestCreator = creatorPerf[0];

  const prompt = `You are a campaign analyst. Generate an executive summary report for a completed B2B LinkedIn creator campaign. This report should be professional and client-ready.

Campaign details:
- Name: ${campaign?.name}
- Objective: ${campaign?.objective}
- Budget: EUR ${campaign?.budget?.toLocaleString() || 0}
- Product: ${campaign?.product || 'Not specified'}

Results:
- Total spend: EUR ${totalSpend.toLocaleString()}
- Creators activated: ${creators.length}
- Posts published: ${posts.filter((p) => p.status === 'live').length}
- Impressions: ${totalImpressions.toLocaleString()}
- Clicks: ${totalClicks.toLocaleString()}
- Leads: ${totalLeads}
- Conversion rate: ${conversionRate}%
- Cost per lead: EUR ${cpl}
- Pipeline value: EUR ${totalPipeline.toLocaleString()}
- Best performing creator: ${bestCreator?.name || 'N/A'} (${bestCreator?.leads || 0} leads)`;

  return generateJSON(prompt, CAMPAIGN_REPORT_SCHEMA);
}

// ============================================================
// CREATOR GROWTH INTELLIGENCE — Differentiator #12
// ============================================================

const CREATOR_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    best_topics: stringArray,
    engagement_trend: str,
    content_tip: str,
    positioning_tip: str,
    earnings_opportunity: str,
  },
  required: ['best_topics', 'engagement_trend', 'content_tip', 'positioning_tip', 'earnings_opportunity'],
};

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
- Posts live: ${posts.filter((p) => p.status === 'live').length}
- Total metrics recorded: ${metrics.length}`;

  return generateJSON(prompt, CREATOR_INSIGHTS_SCHEMA);
}
