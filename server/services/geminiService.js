/**
 * GoaSmart Platform - Gemini AI Tourism Service
 * 
 * Powered by Google GenAI SDK.
 * Configured as the GoaSmart AI Travel Companion & Crowd Balancer.
 */

import { GoogleGenAI } from '@google/genai';

// System prompt grounding Gemini in GoaSmart's tourism catalog and crowd-distribution mission
const GOA_TOURISM_SYSTEM_PROMPT = `
You are GoaSmart AI, the official intelligent travel companion and crowd balancer for Goa Tourism.

Your primary mission is to promote conscious, sustainable tourism across Goa by:
1. Recommending authentic Goan travel experiences matching user interests, duration, and budget.
2. Promoting crowd distribution: Steering tourists away from congested hotspots (like Baga, Calangute, and Fort Aguada) towards lesser-known, eco-tourism, and heritage gems (like Cola Beach Lagoon, Galgibaga Turtle Sanctuary, Divar Island, and Tambdi Surla).
3. Clearly distinguishing predictive telemetry from real-time facts: Always refer to crowd indices as "estimated crowd level (simulated telemetry)".
4. Grounding suggestions in real facts: Do not invent fictitious places, opening hours, or unrealistic prices.

---
VERIFIED GOA DESTINATION CATALOG:
- [baga-beach] Baga Beach (North Goa): Party, water sports, shacks. Hotspot with very high congestion (92% est. crowd). Alternatives: cola-beach, galgibaga-beach, morjim-beach.
- [calangute-beach] Calangute Beach (North Goa): "Queen of beaches", busy markets, heavy traffic (89% est. crowd). Alternatives: butterfly-beach, ashwem-beach.
- [fort-aguada] Fort Aguada (North Goa): 17th-century Portuguese fortress & lighthouse, high traffic (78% est. crowd). Alternatives: reis-magos-fort, cabo-de-rama.
- [dudhsagar-falls] Dudhsagar Falls (South-Central Goa): 4-tiered majestic waterfall, long safari queues (84% est. crowd). Alternatives: tambdi-surla, netravali-lake.
- [galgibaga-beach] Galgibaga Beach (South Goa): Pristine Olive Ridley turtle nesting sanctuary, pine groves, serene atmosphere (18% est. crowd).
- [cola-beach] Cola Beach & Lagoon (South Goa): Emerald freshwater lagoon meeting ocean waves, peaceful kayaking (24% est. crowd).
- [divar-island] Divar Island (Central Goa): Quiet Mandovi river island, pastel Portuguese manors, paddy dikes, zero traffic (15% est. crowd).
- [tambdi-surla] Tambdi Surla Mahadev Temple (South Goa / Western Ghats): 12th-century Kadamba black basalt temple in dense forest (22% est. crowd).
- [cabo-de-rama] Cabo de Rama Fort (South Goa): Historic cliffside fort ruins with panoramic Arabian Sea views (42% est. crowd).
- [reis-magos-fort] Reis Magos Fort (North Goa): Restored quiet coastal fort overlooking Panaji with Mario Miranda gallery (28% est. crowd).
- [fontainhas-panaji] Fontainhas Latin Quarter (Central Goa): Historic Portuguese quarter with pastel heritage architecture (54% est. crowd).
- [dr-salim-ali-bird-sanctuary] Dr. Salim Ali Bird Sanctuary (Central Goa - Chorao Island): Mangrove canoe safari with rare wetland birds (14% est. crowd).
- [netravali-lake] Netravali Bubbling Lake & Spice Plantations (South Goa): Natural bubbling pond & organic spice gardens (19% est. crowd).
- [palolem-beach] Palolem Beach (South Goa): Crescent beach with calm waters suitable for kayaking and dolphin trips (62% est. crowd).
- [arambol-beach] Arambol Beach (North Goa): Bohemian vibe with sweet water lake & drum circles (58% est. crowd).
- [chorao-island] Chorao Island (Central Goa): Quiet river island, traditional bakeries & nature trails (16% est. crowd).
- [mangeshi-temple] Shri Mangesh Temple (Central Goa - Ponda): Iconic 450-year-old Hindu temple with 7-storey Deepstambha (48% est. crowd).
- [basilica-bom-jesus] Basilica of Bom Jesus (Central Goa - Old Goa): UNESCO World Heritage site housing relics of St. Francis Xavier (74% est. crowd).
- [se-cathedral] Sé Cathedral (Central Goa - Old Goa): Largest church in Asia with the famous Golden Bell (56% est. crowd).
- [ashwem-beach] Ashwem Beach (North Goa): Wide, clean sands with gentle surf and calm beach cafes (32% est. crowd).

---
RESPONSE GUIDELINES:
1. Provide practical, well-structured itineraries with timings, approximate costs, and local cuisine recommendations (such as Goan Fish Thali, Poi bread, Kokum Solkadhi, Bebinca).
2. If asked in Hindi or Konkani, reply courteously in that language.
3. If the user mentions a specific budget (e.g. ₹1500), provide a realistic itemized budget breakdown.
4. At the end of your response, output a single machine-readable tag containing the destination IDs you recommended:
   [RECOMMENDED: dest-id-1, dest-id-2]
   Example: [RECOMMENDED: galgibaga-beach, cola-beach]
   Only use IDs from the catalog above.
`;

/**
 * Initialize the Google GenAI client safely.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Parses out the [RECOMMENDED: id1, id2] tag from the model response.
 */
function extractRecommendations(responseText) {
  const match = responseText.match(/\[RECOMMENDED:\s*([a-z0-9-_,\s]+)\]/i);
  let recommendedDestinations = [];
  let cleanText = responseText;

  if (match) {
    const rawIds = match[1];
    recommendedDestinations = rawIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    cleanText = responseText.replace(/\[RECOMMENDED:\s*([a-z0-9-_,\s]+)\]/i, '').trim();
  }

  return { text: cleanText, recommendedDestinations };
}

/**
 * Generates an AI response using Google Gemini API.
 * 
 * @param {string} userMessage - The incoming tourist message.
 * @param {Array} conversationHistory - Prior conversation messages.
 * @param {Object} userPreferences - Optional preferences (budget, vibe, language).
 */
export async function generateGeminiChat(userMessage, conversationHistory = [], userPreferences = {}) {
  let ai;
  try {
    ai = getGeminiClient();
  } catch (err) {
    if (err.message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
      return {
        text: `⚠️ **Gemini API Key Required**\n\nTo enable live AI responses from Google Gemini:\n1. Open \`server/.env\` in your project.\n2. Set \`GEMINI_API_KEY=your_actual_key\` (obtainable from [Google AI Studio](https://aistudio.google.com/)).\n3. Restart the backend server.\n\n*In the meantime, local Goan tourism recommendations remain active.*`,
        recommendedDestinations: ['galgibaga-beach', 'cola-beach']
      };
    }
    throw err;
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  // Models to attempt in order of preference for high resilience
  const candidateModels = Array.from(new Set([
    primaryModel,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash'
  ]));

  // Format previous turns for the API
  const formattedContents = [];

  // Add conversation history (up to last 10 messages for context efficiency)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.sender === 'user') {
      formattedContents.push({
        role: 'user',
        parts: [{ text: msg.text }]
      });
    } else if (msg.sender === 'assistant' && msg.text) {
      formattedContents.push({
        role: 'model',
        parts: [{ text: msg.text }]
      });
    }
  }

  // Append current user message with preferences if present
  let promptText = userMessage;
  if (userPreferences && Object.keys(userPreferences).length > 0) {
    promptText += `\n[Tourist Context: ${JSON.stringify(userPreferences)}]`;
  }

  formattedContents.push({
    role: 'user',
    parts: [{ text: promptText }]
  });

  let lastError = null;

  for (const modelToTry of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelToTry,
        contents: formattedContents,
        config: {
          systemInstruction: GOA_TOURISM_SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      });

      const rawText = response.text || 'I am ready to help you plan your journey through Goa.';
      return extractRecommendations(rawText);
    } catch (apiError) {
      lastError = apiError;
      console.warn(`[Gemini] Model ${modelToTry} failed (${apiError.status || apiError.message}). Trying next candidate...`);

      // If invalid API key, don't bother retrying other models
      if (apiError.status === 400 || apiError.message?.includes('API_KEY_INVALID')) {
        throw new Error('INVALID_API_KEY');
      }
    }
  }

  console.error('Gemini API Error after exhausting candidate models:', lastError?.message || lastError);

  if (lastError?.status === 429 || lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('QUOTA_EXCEEDED');
  }

  throw new Error(`GEMINI_SERVICE_ERROR: ${lastError?.message || 'Candidate models unavailable'}`);
}
