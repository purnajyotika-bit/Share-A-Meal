// Simple in-memory cache to reduce repeated LLM calls for the same question+state
const insightCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates an accurate, context-aware response for the Food Donation App.
 * @param {string} userQuestion - The raw question typed by the user.
 * @param {Object} appStateData - Live data fetched from your database/state.
 * @returns {Promise<string>} - AI-generated insight response
 */
export async function generateFoodAppInsight(userQuestion, appStateData) {
  
  // 1. Define the strict rules for the AI
  const systemRole = `You are the core AI Insights Engine for Share-A-Meal, a smart Food Donation Application.
Your primary goal is to minimize food waste and optimize distribution safety and logistics.

CRITICAL RULES:
1. Base your answers strictly on the [LIVE APP DATA] provided below.
2. If the user asks a question that requires data not present in the [LIVE APP DATA], do not invent figures. Safely reply: "I don't have access to that specific real-time data right now, but based on what I see..."
3. Ensure all advice aligns with food safety guidelines (e.g., refrigeration requirements, shelf-life limits).
4. Keep answers highly actionable, polite, and concise. Use markdown formatting for readability.
5. Provide specific numbers and percentages when available from the live data.
6. Suggest actionable next steps when appropriate.`;

  // 2. Inject actual database/state metrics dynamically
  const liveAppData = `[LIVE APP DATA]
CURRENT USER CONTEXT:
- User Role: ${appStateData.userRole || 'Guest'} (Donor, NGO/Receiver, Volunteer, or Admin)
- User Location: ${appStateData.userLocation || 'Not specified'}
- Timestamp: ${new Date().toISOString()}

FOOD DONATIONS OVERVIEW:
- Total Donations: ${appStateData.totalDonations || 0}
- Available for Pickup: ${appStateData.availableDonations || 0}
- Already Claimed: ${appStateData.claimedDonations || 0}
- Delivered: ${appStateData.deliveredDonations || 0}
- Expired: ${appStateData.expiredDonations || 0}
- Food Categories: ${JSON.stringify(appStateData.foodCategories || {})}
- Total Food Weight Donated: ${appStateData.totalDonatedWeightKg || 0} kg

NGO / SHELTER NEEDS:
- Active NGO Requests: ${appStateData.activeNGORequests || 0}
- Pending Fulfillment: ${appStateData.pendingFulfillment || 0}
- Immediate Needs: ${JSON.stringify(appStateData.immediateNeeds || {})}

VOLUNTEER & LOGISTICS:
- Active Volunteers: ${appStateData.activeVolunteers || 0}
- Pending Pickups: ${appStateData.pendingPickups || 0}
- Pending Deliveries: ${appStateData.pendingDeliveries || 0}
- Average Delivery Time: ${appStateData.avgDeliveryTime || 'N/A'} minutes

CAMPAIGN & FUNDRAISING:
- Active Campaigns: ${appStateData.activeCampaigns || 0}
- Total Funds Raised: ₹${appStateData.totalFundsRaised || 0}
- Donations This Month: ${appStateData.donationsThisMonth || 0}`;

  // 3. Combine everything with the user's specific question
  const finalPrompt = `${systemRole}

${liveAppData}

[USER QUESTION]
"${userQuestion}"`;

  try {
    // Check cache first (key: question + serialized app state)
    const cacheKey = `${userQuestion}::${JSON.stringify(appStateData)}`;
    const cached = insightCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.ts) < CACHE_TTL_MS) {
      return cached.response;
    }

    // 4. Send to your LLM API (Base44 integration)
    console.info('[AI] Sending prompt to LLM — question:', userQuestion);

    // Validate environment for helpful developer messages
    try {
      const envMod = await import('./envCheck.js');
      envMod.validateAIEnv();
    } catch (e) {
      // non-fatal
      console.warn('[AI] envCheck import failed', e?.message || e);
    }

    // Use a dynamic import so tests can run in Node without requiring browser-only modules.
    let response;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Return a deterministic mock response during test runs
      response = `MOCK_INSIGHT: Unable to call LLM in test mode. Question: ${userQuestion}`;
    } else {
      const mod = await import('./base44Client.js');
      const base44 = mod.base44;
      response = await base44.integrations.Core.InvokeLLM({
        prompt: finalPrompt,
        temperature: 0.2, // Keep temperature low (0.1 - 0.3) for factual accuracy
      });
    }

    const final = response || "I couldn't generate an insight at this time. Please try again.";

    // Store in cache
    try {
      insightCache.set(cacheKey, { response: final, ts: now });
    } catch (cErr) {
      // non-fatal caching error
      console.warn('Insight cache set failed', cErr);
    }

    return final;
  } catch (error) {
    console.error('AI Insight generation error:', error);
    return `I encountered an issue generating the insight: ${error.message}. Please try again or contact support.`;
  }
}

/**
 * Prepares live app state data from current component state and database
 * @param {Object} donations - Array of donation objects
 * @param {Object} users - Array of user objects
 * @param {Object} campaigns - Array of campaign objects
 * @param {Object} currentUser - Current authenticated user
 * @returns {Object} - Formatted app state data for AI processing
 */
export function prepareAppStateData(donations = [], users = [], campaigns = [], currentUser = null) {
  const foodCategories = {};
  let totalWeight = 0;

  donations.forEach(d => {
    foodCategories[d.category] = (foodCategories[d.category] || 0) + 1;
    totalWeight += d.weight_kg || 0;
  });

  return {
    userRole: currentUser?.role || 'guest',
    userLocation: currentUser?.location || null,
    totalDonations: donations.length,
    availableDonations: donations.filter(d => d.status === 'available').length,
    claimedDonations: donations.filter(d => d.status === 'claimed').length,
    deliveredDonations: donations.filter(d => d.status === 'delivered').length,
    expiredDonations: donations.filter(d => d.status === 'expired').length,
    foodCategories,
    totalDonatedWeightKg: totalWeight,
    activeNGORequests: users.filter(u => u.role === 'receiver' && u.has_pending_request).length,
    pendingFulfillment: donations.filter(d => d.status === 'claimed' && !d.picked_up).length,
    immediateNeeds: users
      .filter(u => u.role === 'receiver')
      .reduce((acc, u) => {
        if (u.immediate_need) {
          acc[u.organization_name] = u.immediate_need;
        }
        return acc;
      }, {}),
    activeVolunteers: users.filter(u => u.role === 'volunteer' && u.is_active).length,
    pendingPickups: donations.filter(d => d.status === 'claimed' && !d.picked_up).length,
    pendingDeliveries: donations.filter(d => d.status === 'claimed' && d.picked_up && d.status !== 'delivered').length,
    avgDeliveryTime: donations.length > 0 
      ? Math.round(
          donations
            .filter(d => d.delivery_time_minutes)
            .reduce((sum, d) => sum + d.delivery_time_minutes, 0) / 
          donations.filter(d => d.delivery_time_minutes).length
        )
      : null,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalFundsRaised: campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0),
    donationsThisMonth: donations.filter(d => {
      const donationDate = new Date(d.created_at);
      const now = new Date();
      return donationDate.getMonth() === now.getMonth() && 
             donationDate.getFullYear() === now.getFullYear();
    }).length,
  };
}
