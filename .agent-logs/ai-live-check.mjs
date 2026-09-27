/**
 * Live AI contract check.
 *
 * The unit harnesses can only prove the AI layer is syntactically valid. This
 * one calls the real Gemini endpoint and asserts the response matches the exact
 * field names the UI reads, because a schema/consumer mismatch is invisible
 * until a user clicks the button and sees an empty panel.
 *
 *   npm run check:ai
 *
 * Skips itself (exit 0) when no key is configured, so it is safe to run
 * anywhere. It never prints the key.
 */
import { createServer, loadEnv } from 'vite';
import fs from 'node:fs';

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

// The key lives in .env.local, which Vite exposes to modules as import.meta.env
// rather than process.env. loadEnv is how the harness can see the same value
// without duplicating the .env parsing.
const KEY = loadEnv('development', 'D:/nanoo/CreaterFlow', 'VITE_GEMINI_API_KEY').VITE_GEMINI_API_KEY;

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures++;
};

// A live check against a rate-limited free-tier endpoint will occasionally hit
// 429/503 even with the client's own retries. Absorb that here so one unlucky
// call does not abort the run and hide the remaining assertions.
//
// A sustained 429 is different: it means the key's quota is spent, which says
// nothing about the code. That is reported as a skip rather than a failure, so
// a quota-exhausted key cannot be mistaken for a broken AI contract.
let quotaExhausted = false;
const live = async (label, fn) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const transient = [429, 500, 502, 503, 504].includes(err.status);
      if (!transient || attempt === 3) {
        if (err.status === 429) {
          quotaExhausted = true;
          console.log(`SKIP ${label} :: 429 after ${attempt} attempts (quota exhausted, not a code failure)`);
        } else {
          check(label, false, `${err.name}: ${err.message}`.slice(0, 160));
        }
        return null;
      }
      console.log(`     (${label}: ${err.status} on attempt ${attempt}, retrying)`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return null;
};

const ai = await server.ssrLoadModule('/src/lib/campaignAi.js');

if (!ai.isGeminiConfigured) {
  console.log('SKIP no VITE_GEMINI_API_KEY in .env.local');
  await server.close();
  process.exit(0);
}

// A missing key must not have thrown during module load. The old SDK built its
// client at module scope, so a missing key broke the importing page instead of
// surfacing a usable message.
check('module loads without a key error', true);
check('NOT_CONFIGURED_ERROR is actionable', /npm run doctor/.test(ai.NOT_CONFIGURED_ERROR));

// ── reviewContentWithAI: shape asserted by AIContentReview.jsx ──────────────
const review = await live('reviewContentWithAI returns a usable review', () =>
  ai.reviewContentWithAI(
    'We built a project management tool. Try it today!',
    {
      objective: 'Lead generation',
      target_audience: 'Engineering managers at B2B SaaS companies',
      key_messages: ['Ship on time without status meetings'],
      creator_guidelines: 'No hype, no fake urgency, no unsupported claims.',
      content_direction: 'Practical workflow advice',
      desired_outcome: 'Booked demos',
    }
  )
);
if (review) {
  check('review.status is a known value', ['passed', 'needs_revision'].includes(review.status), review.status);
  check('review.summary is a string', typeof review.summary === 'string' && review.summary.length > 0);
  check('review.checks is a non-empty array', Array.isArray(review.checks) && review.checks.length > 0);
  check(
    'review.checks entries have name/passed/note',
    review.checks.every((c) => typeof c.name === 'string' && typeof c.passed === 'boolean' && typeof c.note === 'string')
  );
  check('review.suggestions is an array', Array.isArray(review.suggestions));
}

// ── generateCampaignStrategy: every key NewCampaign.jsx dereferences ─────────
const strategy = await live('generateCampaignStrategy returns a strategy', () =>
  ai.generateCampaignStrategy({
    product: 'FlowPilot',
    website: 'https://flowpilot.example',
    industry: 'Project management SaaS',
    target_audience: 'Engineering managers at B2B SaaS companies with 50-500 staff',
    objective: 'Lead generation',
    geography: 'DACH',
    budget: 8000,
    desired_outcome: '150 qualified demos',
    keyMessage: 'Replace status meetings with automated delivery reporting',
  })
);
if (!strategy) {
  console.log(
    quotaExhausted
      ? '\nStopped: the Gemini key is out of quota, so the strategy field contract could not be asserted. Re-run later or use a key with quota.'
      : '\nAborting: the strategy call failed, so its field contract cannot be asserted.'
  );
  await server.close();
  process.exit(quotaExhausted ? 0 : 1);
}

const required = {
  'strategy.objective': strategy?.strategy?.objective,
  'strategy.target_audience': strategy?.strategy?.target_audience,
  'strategy.positioning': strategy?.strategy?.positioning,
  'strategy.campaign_type': strategy?.strategy?.campaign_type,
  'strategy.estimated_duration': strategy?.strategy?.estimated_duration,
  'creator_requirements.recommended_niches': strategy?.creator_requirements?.recommended_niches,
  'creator_requirements.audience_characteristics': strategy?.creator_requirements?.audience_characteristics,
  'creator_requirements.creator_size': strategy?.creator_requirements?.creator_size,
  'creator_requirements.estimated_creators': strategy?.creator_requirements?.estimated_creators,
  'campaign.campaign_name': strategy?.campaign?.campaign_name,
  'campaign.brief': strategy?.campaign?.brief,
  'campaign.key_messages': strategy?.campaign?.key_messages,
  'campaign.creator_guidelines': strategy?.campaign?.creator_guidelines,
  'campaign.content_direction': strategy?.campaign?.content_direction,
  'campaign.cta': strategy?.campaign?.cta,
  'measurement.tracking_strategy': strategy?.measurement?.tracking_strategy,
  'measurement.recommended_kpis': strategy?.measurement?.recommended_kpis,
  'measurement.attribution_approach': strategy?.measurement?.attribution_approach,
};

const missing = Object.entries(required)
  .filter(([, v]) => v === undefined || v === null || v === '')
  .map(([k]) => k);
check('strategy has every field NewCampaign.jsx reads', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : `${Object.keys(required).length} fields`);
check('campaign.key_messages is a non-empty array', Array.isArray(strategy?.campaign?.key_messages) && strategy.campaign.key_messages.length > 0);

// The prompt is built from these form fields, so a renamed field would show up
// as the literal string "undefined" inside the generated brief.
const briefText = JSON.stringify(strategy);
check('no undefined leaked into the prompt', !/\bundefined\b/.test(briefText));
check('no "Not provided" noise in strategy text', !/"Not provided"/.test(briefText));

// ── generateCreatorContentAngles: CampaignCreator field names ───────────────
const angles = await live('generateCreatorContentAngles returns angles', () =>
  ai.generateCreatorContentAngles(
    [
      { creator_id: 'c1', creator_name: 'Mara Feld', creator_niche: 'DevTools & Engineering', creator_followers: 42000 },
      { creator_id: 'c2', creator_name: 'Jonas Reiter', creator_niche: 'Sales & GTM', creator_followers: 18500 },
    ],
    { product: 'FlowPilot', objective: 'Lead generation', target_audience: 'Engineering managers', key_messages: ['Replace status meetings'] }
  )
);
if (angles) {
  check('angles.angles is an array', Array.isArray(angles.angles));
  check('one angle per creator', angles.angles?.length === 2, `got ${angles.angles?.length}`);
  check(
    'angle entries match CampaignDetail.jsx field reads',
    angles.angles?.every(
      (a) =>
        typeof a.creator_name === 'string' &&
        typeof a.angle_name === 'string' &&
        typeof a.angle_description === 'string' &&
        Array.isArray(a.key_talking_points)
    )
  );
  check('angles differ per creator', angles.angles?.[0]?.angle_name !== angles.angles?.[1]?.angle_name);
  // creator_name must come from the CampaignCreator row, not a Creator-only field.
  check('angles used CampaignCreator.creator_name', angles.angles?.some((a) => a.creator_name === 'Mara Feld'));
}

// ── error paths must be useful and must not leak the key ────────────────────
// A deliberately impossible schema forces a real API error, which is the only
// way to prove the messages are actionable and that the key never leaks.
// Note: `err instanceof TypeError` would mean the assertion below tested
// "function is missing" rather than the real error path, so it is called out.
try {
  const parsed = await ai.generateJSON('reply with the single word hi', {
    type: 'object',
    properties: { a: { type: 'string' } },
    required: ['a'],
  });
  check('schema-constrained JSON parses', typeof parsed?.a === 'string', JSON.stringify(parsed));
} catch (err) {
  check('schema-constrained JSON parses', false, `${err.name}: ${err.message}`.slice(0, 140));
}

// The API's own 404 for an unavailable model is the most common real failure
// after a model rename, so assert the message names the model and the fix.
try {
  await ai.generateText('test', { model: 'gemini-does-not-exist' });
  check('bad model surfaces an error', false, 'request unexpectedly succeeded');
} catch (err) {
  const isMissingCall = err instanceof TypeError;
  check(
    'bad model produces an actionable GeminiError',
    !isMissingCall && err.name === 'GeminiError' && /VITE_GEMINI_MODEL/.test(err.message),
    isMissingCall ? 'generateText is not exported' : `${err.name}: ${err.message}`.slice(0, 140)
  );
  check('error message never contains the key', !KEY || !String(err.message).includes(KEY));
}

fs.writeFileSync('.agent-logs/ai-live-sample.json', JSON.stringify({ review, strategy, angles }, null, 2));
console.log('\nsample written to .agent-logs/ai-live-sample.json');

await server.close();
console.log(failures === 0 ? '\nAI live check passed.' : `\n${failures} AI live check failure(s).`);
process.exit(failures === 0 ? 0 : 1);
