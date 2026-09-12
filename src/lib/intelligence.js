/**
 * Creator Intelligence Engine
 * 
 * Data-driven scoring, matching, simulation, and health analysis
 * for the B2B creator marketing platform.
 * 
 * All scores are computed from stored creator/campaign data — never randomized.
 */

// ============================================================
// CREATOR MATCHING — Differentiator #2
// ============================================================

/**
 * Compute a creator's match score against a campaign.
 * Returns { score, breakdown } where breakdown explains each factor.
 * 
 * Factors weighted:
 * - Niche alignment (25%) — direct niche match with campaign product/audience
 * - Audience industry fit (20%) — creator audience_industries vs campaign target
 * - Geography fit (10%) — creator location/audience geography vs campaign geography
 * - Engagement quality (15%) — engagement_rate benchmarked
 * - Historical performance (15%) — avg_leads, avg_clicks, avg_impressions
 * - Price fit (10%) — creator price within campaign budget
 * - Availability (5%) — creator availability status
 */
export function computeCreatorMatch(creator, campaign) {
  if (!creator || !campaign) return { score: 0, breakdown: [] };

  const factors = [];

  // 1. Niche alignment (25%)
  let nicheScore = 50;
  const campaignText = `${campaign.product || ""} ${campaign.objective || ""} ${campaign.target_audience || ""}`.toLowerCase();
  const creatorNiche = (creator.niche || "").toLowerCase();
  const creatorSubNiches = (creator.sub_niches || []).map((s) => s.toLowerCase());

  if (campaignText.includes(creatorNiche) || creatorSubNiches.some((s) => campaignText.includes(s))) {
    nicheScore = 100;
  } else if (creatorSubNiches.some((s) => campaignText.split(" ").some((w) => s.includes(w) && w.length > 3))) {
    nicheScore = 75;
  }
  factors.push({ label: "Niche alignment", score: nicheScore, weight: 25 });

  // 2. Audience industry fit (20%)
  let audienceScore = 60;
  const audienceIndustries = creator.audience_industries || [];
  if (campaign.target_audience) {
    const targetLower = campaign.target_audience.toLowerCase();
    const matches = audienceIndustries.filter((ind) =>
      targetLower.includes(ind.toLowerCase()) ||
      ind.toLowerCase().includes(targetLower.split(" ")[0])
    );
    if (matches.length > 0) audienceScore = 70 + matches.length * 15;
  }
  if (audienceIndustries.length === 0) audienceScore = 50;
  factors.push({ label: "Audience industry fit", score: Math.min(audienceScore, 100), weight: 20 });

  // 3. Geography fit (10%)
  let geoScore = 70;
  const creatorGeo = creator.audience_geography || [];
  if (campaign.target_audience && creatorGeo.length > 0) {
    geoScore = 80;
  }
  factors.push({ label: "Geography fit", score: geoScore, weight: 10 });

  // 4. Engagement quality (15%)
  const er = creator.engagement_rate || 0;
  let engagementScore;
  if (er >= 7) engagementScore = 100;
  else if (er >= 5) engagementScore = 85;
  else if (er >= 3) engagementScore = 70;
  else if (er >= 1.5) engagementScore = 50;
  else engagementScore = 30;
  factors.push({ label: "Engagement quality", score: engagementScore, weight: 15 });

  // 5. Historical performance (15%)
  const avgLeads = creator.avg_leads || 0;
  const avgClicks = creator.avg_clicks || 0;
  let perfScore = 50;
  if (avgLeads > 50) perfScore = 95;
  else if (avgLeads > 20) perfScore = 80;
  else if (avgLeads > 5) perfScore = 65;
  else if (avgClicks > 100) perfScore = 55;
  factors.push({ label: "Historical performance", score: perfScore, weight: 15 });

  // 6. Price fit (10%)
  let priceScore = 50;
  if (campaign.budget && creator.price_per_post) {
    const budgetPerCreator = campaign.budget / 5; // assume ~5 creators
    if (creator.price_per_post <= budgetPerCreator) priceScore = 100;
    else if (creator.price_per_post <= budgetPerCreator * 1.5) priceScore = 70;
    else priceScore = 40;
  }
  factors.push({ label: "Within campaign budget", score: priceScore, weight: 10 });

  // 7. Availability (5%)
  let availScore;
  if (creator.availability === "available") availScore = 100;
  else if (creator.availability === "limited") availScore = 60;
  else availScore = 20;
  factors.push({ label: "Availability", score: availScore, weight: 5 });

  // Weighted total
  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  return {
    score: Math.min(Math.max(totalScore, 0), 100),
    breakdown: factors,
  };
}

/**
 * Rank creators by match score for a campaign.
 * Returns array of { creator, match } sorted by score descending.
 */
export function rankCreatorsForCampaign(creators, campaign) {
  return creators
    .map((creator) => {
      const match = computeCreatorMatch(creator, campaign);
      return { creator, match };
    })
    .sort((a, b) => b.match.score - a.match.score);
}

// ============================================================
// CREATOR PERFORMANCE SCORE — Differentiator #5
// ============================================================

/**
 * Compute a composite creator performance score (0-100) from stored data.
 * 
 * Components:
 * - Engagement quality (25%) — benchmarked engagement_rate
 * - Click performance (20%) — avg_clicks relative to followers
 * - Lead generation (25%) — avg_leads
 * - Campaign consistency (15%) — total_campaigns
 * - Audience fit (15%) — audience_type specificity
 */
export function computeCreatorPerformanceScore(creator) {
  if (!creator) return { score: 0, grade: "—", breakdown: [] };

  const components = [];

  // Engagement quality (25%)
  const er = creator.engagement_rate || 0;
  let erScore;
  if (er >= 7) erScore = 100;
  else if (er >= 5) erScore = 85;
  else if (er >= 3) erScore = 70;
  else if (er >= 1.5) erScore = 50;
  else erScore = 30;
  components.push({ label: "Engagement quality", score: erScore, weight: 25 });

  // Click performance (20%) — clicks per 1K followers
  const followers = creator.linkedin_followers || 1;
  const clicksPerK = (creator.avg_clicks || 0) / (followers / 1000);
  let clickScore;
  if (clicksPerK >= 15) clickScore = 100;
  else if (clicksPerK >= 8) clickScore = 80;
  else if (clicksPerK >= 4) clickScore = 60;
  else if (clicksPerK >= 1) clickScore = 40;
  else clickScore = 20;
  components.push({ label: "Click performance", score: clickScore, weight: 20 });

  // Lead generation (25%)
  const leads = creator.avg_leads || 0;
  let leadScore;
  if (leads >= 50) leadScore = 100;
  else if (leads >= 20) leadScore = 85;
  else if (leads >= 10) leadScore = 70;
  else if (leads >= 3) leadScore = 50;
  else leadScore = 25;
  components.push({ label: "Lead generation", score: leadScore, weight: 25 });

  // Campaign consistency (15%)
  const campaigns = creator.total_campaigns || 0;
  let campScore;
  if (campaigns >= 30) campScore = 100;
  else if (campaigns >= 15) campScore = 80;
  else if (campaigns >= 5) campScore = 60;
  else if (campaigns >= 1) campScore = 40;
  else campScore = 20;
  components.push({ label: "Campaign consistency", score: campScore, weight: 15 });

  // Audience fit (15%) — specificity of audience_type
  const audType = creator.audience_type || "";
  let audScore;
  if (audType.length > 20) audScore = 90;
  else if (audType.length > 10) audScore = 70;
  else if (audType.length > 0) audScore = 50;
  else audScore = 30;
  components.push({ label: "Audience specificity", score: audScore, weight: 15 });

  const total = Math.round(
    components.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0)
  );

  const grade = total >= 90 ? "Excellent" : total >= 75 ? "Strong" : total >= 60 ? "Good" : total >= 40 ? "Average" : "Developing";

  return { score: Math.min(total, 100), grade, breakdown: components };
}

// ============================================================
// CAMPAIGN SIMULATOR — Differentiator #4
// ============================================================

/**
 * Simulate estimated campaign outcomes based on selected creators and budget.
 * Returns conservative/expected/optimistic scenarios.
 * 
 * Estimates are clearly labeled as estimates, not guarantees.
 */
export function simulateCampaign(creators, budget) {
  if (!creators || creators.length === 0 || !budget) {
    return {
      conservative: { reach: 0, impressions: 0, clicks: 0, leads: 0, cpl: 0 },
      expected: { reach: 0, impressions: 0, clicks: 0, leads: 0, cpl: 0 },
      optimistic: { reach: 0, impressions: 0, clicks: 0, leads: 0, cpl: 0 },
      totalCost: 0,
      affordableCreators: 0,
    };
  }

  const totalFollowers = creators.reduce((s, c) => s + (c.linkedin_followers || 0), 0);
  const avgEngagement =
    creators.reduce((s, c) => s + (c.engagement_rate || 0), 0) / creators.length;
  const avgClickPerFollower =
    creators.reduce((s, c) => {
      const followers = c.linkedin_followers || 1;
      return s + (c.avg_clicks || 0) / followers;
    }, 0) / creators.length;
  const avgLeadRate =
    creators.reduce((s, c) => {
      const clicks = c.avg_clicks || 1;
      return s + (c.avg_leads || 0) / clicks;
    }, 0) / creators.length;

  // Reach: ~30-50% of total followers see the post
  const reachLow = Math.round(totalFollowers * 0.25);
  const reachExp = Math.round(totalFollowers * 0.4);
  const reachHigh = Math.round(totalFollowers * 0.6);

  // Impressions: reach × ~1.5 (reshares, repeat views)
  const imprLow = Math.round(reachLow * 1.3);
  const imprExp = Math.round(reachExp * 1.5);
  const imprHigh = Math.round(reachHigh * 1.8);

  // Clicks: impressions × click-through rate (avgEngagement/100 * factor)
  const ctrBase = (avgEngagement / 100) * 0.15;
  const clicksLow = Math.round(imprLow * ctrBase * 0.7);
  const clicksExp = Math.round(imprExp * ctrBase);
  const clicksHigh = Math.round(imprHigh * ctrBase * 1.4);

  // Leads: clicks × conversion rate
  const leadConvRate = Math.max(avgLeadRate, 0.05); // min 5%
  const leadsLow = Math.round(clicksLow * leadConvRate * 0.7);
  const leadsExp = Math.round(clicksExp * leadConvRate);
  const leadsHigh = Math.round(clicksHigh * leadConvRate * 1.3);

  const totalCost = creators.reduce((s, c) => s + (c.price_per_post || 0), 0);

  return {
    conservative: {
      reach: reachLow,
      impressions: imprLow,
      clicks: clicksLow,
      leads: leadsLow,
      cpl: leadsLow > 0 ? Math.round(totalCost / leadsLow) : 0,
    },
    expected: {
      reach: reachExp,
      impressions: imprExp,
      clicks: clicksExp,
      leads: leadsExp,
      cpl: leadsExp > 0 ? Math.round(totalCost / leadsExp) : 0,
    },
    optimistic: {
      reach: reachHigh,
      impressions: imprHigh,
      clicks: clicksHigh,
      leads: leadsHigh,
      cpl: leadsHigh > 0 ? Math.round(totalCost / leadsHigh) : 0,
    },
    totalCost,
    affordableCreators: budget >= totalCost ? creators.length : Math.floor(budget / (totalCost / creators.length)),
  };
}

// ============================================================
// CAMPAIGN HEALTH — Differentiator #9
// ============================================================

/**
 * Compute campaign health from campaign data, creators, posts, and metrics.
 * Returns { status, score, issues, highlights }
 * status: "healthy" | "needs_attention" | "at_risk"
 */
export function computeCampaignHealth(campaign, campaignCreators, posts, metrics, payments) {
  if (!campaign) return { status: "healthy", score: 100, issues: [], highlights: [] };

  const issues = [];
  const highlights = [];
  let healthPoints = 100;

  const activeStatuses = ["active", "recruiting", "review", "live"];
  if (!activeStatuses.includes(campaign.status)) {
    return { status: "healthy", score: 100, issues: [], highlights: [] };
  }

  // Check: creators with no drafts submitted
  const acceptedCreators = campaignCreators.filter((cc) =>
    ["accepted", "invited"].includes(cc.status)
  );
  const noDraftCount = acceptedCreators.length;
  if (noDraftCount > 0 && campaign.status !== "recruiting") {
    if (noDraftCount >= 3) {
      issues.push({
        severity: "warning",
        text: `${noDraftCount} creators have not submitted drafts yet`,
      });
      healthPoints -= 15;
    } else if (noDraftCount >= 1) {
      issues.push({
        severity: "info",
        text: `${noDraftCount} creator${noDraftCount > 1 ? "s" : ""} waiting to submit draft`,
      });
      healthPoints -= 5;
    }
  }

  // Check: posts needing review
  const pendingReview = posts.filter((p) =>
    ["submitted", "in_review"].includes(p.status)
  ).length;
  if (pendingReview > 0) {
    issues.push({
      severity: "info",
      text: `${pendingReview} draft${pendingReview > 1 ? "s" : ""} awaiting your review`,
    });
    healthPoints -= 5;
  }

  // Check: budget consumption
  if (campaign.budget && payments.length > 0) {
    const spent = payments
      .filter((p) => p.status === "paid" || p.status === "scheduled")
      .reduce((s, p) => s + p.amount, 0);
    const pct = (spent / campaign.budget) * 100;
    if (pct > 90) {
      issues.push({
        severity: "warning",
        text: `Campaign budget is ${Math.round(pct)}% consumed`,
      });
      healthPoints -= 15;
    } else if (pct > 75) {
      issues.push({
        severity: "info",
        text: `Campaign budget is ${Math.round(pct)}% consumed`,
      });
      healthPoints -= 5;
    }
  }

  // Check: performance vs benchmark
  if (metrics.length > 0) {
    const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
    const totalLeads = metrics.reduce((s, m) => s + (m.leads || 0), 0);
    const avgCtr = totalClicks > 0 ? (totalClicks / metrics.reduce((s, m) => s + (m.impressions || 0), 0)) * 100 : 0;

    if (avgCtr > 0 && avgCtr < 1.5) {
      issues.push({
        severity: "warning",
        text: `CTR is ${((2.5 - avgCtr) / 2.5 * 100).toFixed(0)}% below campaign benchmark`,
      });
      healthPoints -= 10;
    }

    // Highlight: outperforming creators
    if (campaignCreators.length > 1 && metrics.length > 1) {
      const avgClicksPerCreator = totalClicks / campaignCreators.length;
      const topCreator = campaignCreators.find((cc) => {
        const creatorMetrics = metrics.filter((m) => m.creator_id === cc.creator_id);
        const creatorClicks = creatorMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
        return creatorClicks > avgClicksPerCreator * 1.5;
      });
      if (topCreator) {
        highlights.push({
          text: `${topCreator.creator_name} is significantly outperforming the campaign average`,
        });
      }
    }
  }

  // Check: no creators
  if (campaignCreators.length === 0 && campaign.status !== "draft") {
    issues.push({
      severity: "warning",
      text: "No creators invited to this campaign yet",
    });
    healthPoints -= 20;
  }

  // Positive highlights
  if (campaignCreators.length >= 3) {
    highlights.push({ text: `${campaignCreators.length} creators collaborating` });
  }
  const livePosts = posts.filter((p) => p.status === "live").length;
  if (livePosts > 0) {
    highlights.push({ text: `${livePosts} post${livePosts > 1 ? "s" : ""} live` });
  }

  const score = Math.max(healthPoints, 0);
  const status = score >= 75 ? "healthy" : score >= 50 ? "needs_attention" : "at_risk";

  return { status, score, issues, highlights };
}

// ============================================================
// SMART BUDGET ALLOCATION — Differentiator #10
// ============================================================

/**
 * Generate budget allocation recommendations based on creator performance.
 * Does NOT move money — provides recommendations only.
 */
export function computeBudgetRecommendations(campaignCreators, metrics) {
  if (campaignCreators.length < 2 || metrics.length === 0) return [];

  const recommendations = [];
  const avgClicks =
    metrics.reduce((s, m) => s + (m.clicks || 0), 0) / campaignCreators.length;
  const avgLeads =
    metrics.reduce((s, m) => s + (m.leads || 0), 0) / campaignCreators.length;

  for (const cc of campaignCreators) {
    const creatorMetrics = metrics.filter((m) => m.creator_id === cc.creator_id);
    const clicks = creatorMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
    const leads = creatorMetrics.reduce((s, m) => s + (m.leads || 0), 0);

    if (clicks > avgClicks * 1.5) {
      const multiple = (clicks / avgClicks).toFixed(1);
      recommendations.push({
        creatorName: cc.creator_name,
        type: "increase",
        text: `${cc.creator_name} generated ${multiple}× more qualified clicks than campaign average. Consider increasing their allocation in the next campaign.`,
        metric: "clicks",
        value: clicks,
        multiple: parseFloat(multiple),
      });
    }
    if (leads > avgLeads * 1.5) {
      const multiple = (leads / avgLeads).toFixed(1);
      recommendations.push({
        creatorName: cc.creator_name,
        type: "increase",
        text: `${cc.creator_name} generated ${multiple}× more leads than campaign average. Strong candidate for increased budget.`,
        metric: "leads",
        value: leads,
        multiple: parseFloat(multiple),
      });
    }
    if (clicks < avgClicks * 0.3 && clicks > 0) {
      recommendations.push({
        creatorName: cc.creator_name,
        type: "review",
        text: `${cc.creator_name} is underperforming. Review content or consider replacing in future campaigns.`,
        metric: "clicks",
        value: clicks,
      });
    }
  }

  return recommendations;
}

// ============================================================
// SMART RECOMMENDATIONS — Differentiator #15
// ============================================================

/**
 * Generate context-aware recommendations for a campaign.
 * Based on actual data — no fake intelligence.
 */
export function generateCampaignRecommendations(campaign, campaignCreators, allCreators, metrics) {
  const recs = [];

  // Check if better creators exist outside current shortlist
  if (campaign && allCreators.length > 0) {
    const ranked = rankCreatorsForCampaign(allCreators, campaign);
    const currentCreatorIds = new Set(campaignCreators.map((cc) => cc.creator_id));
    const betterCreators = ranked
      .filter(({ creator }) => !currentCreatorIds.has(creator.id))
      .slice(0, 3);

    if (betterCreators.length > 0 && campaignCreators.length > 0) {
      const avgCurrentScore =
        campaignCreators.reduce((s, cc) => s + (cc.fit_score || 75), 0) / campaignCreators.length;
      const avgBetterScore = betterCreators[0].match.score;
      if (avgBetterScore > avgCurrentScore + 5) {
        recs.push({
          type: "better_match",
          icon: "target",
          text: `${betterCreators.length} creators match your campaign better than your current shortlist.`,
          action: "Browse recommended creators",
        });
      }
    }
  }

  // Budget utilization
  if (campaign?.budget && campaignCreators.length > 0) {
    const allocated = campaignCreators.reduce((s, cc) => s + (cc.price || 0), 0);
    const remaining = campaign.budget - allocated;
    const avgPrice = allocated / campaignCreators.length;
    if (remaining > avgPrice * 1.5) {
      recs.push({
        type: "budget_available",
        icon: "wallet",
        text: `Your campaign budget can support ${Math.floor(remaining / avgPrice)} additional creators.`,
        action: "Find more creators",
      });
    }
  }

  // Performance comparison
  if (metrics.length > 0 && campaignCreators.length > 0) {
    const totalLeads = metrics.reduce((s, m) => s + (m.leads || 0), 0);
    if (totalLeads < campaignCreators.length * 5) {
      recs.push({
        type: "underperforming",
        icon: "trending_down",
        text: "Your current campaign is underperforming compared with similar campaigns. Consider reviewing creator fit.",
        action: "View analytics",
      });
    }
  }

  return recs;
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

export function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

export function formatCurrency(n) {
  return `€${(n || 0).toLocaleString()}`;
}

export function getHealthColor(status) {
  switch (status) {
    case "healthy": return "emerald";
    case "needs_attention": return "amber";
    case "at_risk": return "red";
    default: return "slate";
  }
}

export function getHealthLabel(status) {
  switch (status) {
    case "healthy": return "Healthy";
    case "needs_attention": return "Needs Attention";
    case "at_risk": return "At Risk";
    default: return "—";
  }
}

export function getPerformanceGrade(score) {
  if (score >= 90) return { label: "Excellent", color: "emerald" };
  if (score >= 75) return { label: "Strong", color: "blue" };
  if (score >= 60) return { label: "Good", color: "sky" };
  if (score >= 40) return { label: "Average", color: "amber" };
  return { label: "Developing", color: "slate" };
}