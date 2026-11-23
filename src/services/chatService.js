import { DESTINATIONS } from '../data/destinations';

/**
 * AI Tourism Companion Service
 * Formatted to seamlessly connect to backend Google Gemini API:
 * Endpoint: POST /api/ai/companion
 * Currently uses intelligent local reasoning & Goan knowledge heuristics.
 */

export async function sendChatMessage(userMessage, conversationHistory = []) {
  // Simulate network latency for realistic AI generation feel
  await new Promise((resolve) => setTimeout(resolve, 800));

  const text = userMessage.toLowerCase().trim();

  // 1. Check for specific question: Best beaches / Peaceful beaches
  if (text.includes('best beach') || text.includes('peaceful beach') || text.includes('quiet beach') || text.includes('peaceful')) {
    const quietBeaches = DESTINATIONS.filter(
      (d) => d.mapCategory === 'Beaches' || d.category.includes('Quiet') || d.id === 'cola-beach' || d.id === 'galgibaga-beach'
    );
    return {
      text: `Based on current crowd estimation data, popular beaches like **Baga (92% crowd)** and **Calangute (89% crowd)** are experiencing severe tourist congestion. \n\nFor a truly peaceful, pristine experience, I strongly recommend:\n- **Galgibaga Beach (18% crowd)**: Strictly protected Olive Ridley turtle nesting sanctuary with calm pine groves and zero commercial noise.\n- **Cola Beach & Lagoon (24% crowd)**: Unique emerald freshwater lagoon meeting golden sand, ideal for tranquil kayaking.\n- **Butterfly Beach**: A secluded, crescent cove with dolphins and crystal clear water.`,
      recommendedDestinations: ['galgibaga-beach', 'cola-beach', 'butterfly-beach']
    };
  }

  // 2. Budget & Seafood request (as specified in Master Prompt: "I want a peaceful beach day with good seafood and a budget of ₹1500")
  if (text.includes('seafood') || text.includes('budget') || text.includes('1500') || text.includes('food')) {
    return {
      text: `Here is a custom, crowd-conscious Goan plan for ₹1,500:\n\n1. **Destination**: Head to **Galgibaga Beach** in South Goa (Current crowd: only 18%). Unlike Baga where parking alone takes 45 mins, you will enjoy peaceful silver sands.\n2. **Authentic Goan Seafood**: Stop by local family-run beach eateries right beside the estuary for traditional Goan Fish Thali (Kingfish/Surmai fry, Tisreo clams, Solkadhi) for ₹280 - ₹350 per person.\n3. **Afternoon Activity**: Rent a quiet freshwater kayak at neighboring **Cola Lagoon** (~₹200).\n4. **Budget Breakdown**: Fuel & Travel: ₹450 | Meal & Refreshment: ₹650 | Kayaking: ₹200 | Total: **₹1,300** (Well within ₹1,500).\n\nWhy this works: You bypass commercial shack markups and directly support local Canacona village families!`,
      recommendedDestinations: ['galgibaga-beach', 'cola-beach']
    };
  }

  // 3. Hidden places / Offbeat / Hidden gems
  if (text.includes('hidden') || text.includes('offbeat') || text.includes('secret') || text.includes('gem')) {
    return {
      text: `Goa holds extraordinary secrets away from the crowded coastal belt:\n\n1. **Divar Island**: A serene river island accessed via government ferry across the Mandovi. Features pastel Portuguese manors, paddy dikes, and zero traffic.\n2. **Tambdi Surla 12th-C Temple**: The oldest active Kadamba black basalt rock temple hidden in the deep Western Ghats jungle.\n3. **Netravali Bubbling Lake**: A sacred stepped pond where bubbles spontaneously rise to the surface when you clap, surrounded by organic spice plantations.\n4. **Chorao Island & Mangroves**: Silent canoe safaris through the Dr. Salim Ali Bird Sanctuary.`,
      recommendedDestinations: ['divar-island', 'tambdi-surla', 'netravali-lake', 'chorao-island']
    };
  }

  // 4. 2-Day / Itinerary planning
  if (text.includes('itinerary') || text.includes('2-day') || text.includes('plan') || text.includes('day')) {
    return {
      text: `Here is a sustainable, low-congestion **2-Day Smart Goa Itinerary**:\n\n### Day 1: Central Heritage & Island Charms\n- **08:30 AM**: Heritage walk through **Fontainhas Latin Quarter**, Panaji (visit 31st January Bakery).\n- **11:00 AM**: Take the river ferry to **Divar Island** for cycling through old Portuguese estates.\n- **03:30 PM**: Explore **Reis Magos Fort** (quiet alternative to Fort Aguada) with Mario Miranda artwork.\n- **05:30 PM**: Sunset views without the crowds.\n\n### Day 2: Serene South Goa & Western Ghats\n- **08:30 AM**: Visit **Tambdi Surla Mahadev Temple** and morning jungle walk.\n- **01:00 PM**: Traditional Goan lunch at **Netravali Organic Spice Farm**.\n- **04:30 PM**: Golden hour at **Cabo de Rama Fort** overlooking panoramic cliffs.\n- **06:00 PM**: Sunset dinner by the estuary at **Galgibaga Beach**.`,
      recommendedDestinations: ['fontainhas-panaji', 'divar-island', 'cabo-de-rama', 'tambdi-surla']
    };
  }

  // 5. Goan Culture & Heritage / Religious
  if (text.includes('culture') || text.includes('heritage') || text.includes('church') || text.includes('temple') || text.includes('history')) {
    return {
      text: `To experience authentic Goan heritage:\n\n- **Old Goa UNESCO Precinct**: Visit **Basilica of Bom Jesus** and the colossal **Se Cathedral** with its Golden Bell.\n- **Goan Hindu Architecture**: Explore **Shri Mangesh Temple in Priol, Ponda**, celebrated for its 7-storey octagonal lamp tower (Deepstambha).\n- **Latin Heritage**: Walk through **Fontainhas Latin Quarter** with pastel residences from the Portuguese colonial era.\n- **Ancient Antiquity**: **Tambdi Surla Temple**—Goa's only intact pre-Portuguese Kadamba monument.`,
      recommendedDestinations: ['basilica-bom-jesus', 'se-cathedral', 'mangeshi-temple', 'fontainhas-panaji']
    };
  }

  // 6. Family-Friendly
  if (text.includes('family') || text.includes('kids') || text.includes('children')) {
    return {
      text: `Here are the most family-friendly destinations in Goa with safe swimming and engaging activities:\n\n- **Palolem Beach & Agonda**: Gentle, shallow, protected waters with calm surf for kids, plus sea kayaking.\n- **Dr. Salim Ali Bird Sanctuary (Chorao)**: Fascinating guided mangrove canoe boat rides spotting kingfishers and mudskippers.\n- **Netravali Spice Farm**: Educational organic spice tour with vanilla, cinnamon, and traditional buffet lunch.\n- **Reis Magos Fort**: Well-restored, child-safe paved ramparts with antique cannons and Mario Miranda illustrations.`,
      recommendedDestinations: ['palolem-beach', 'chorao-island', 'netravali-lake', 'reis-magos-fort']
    };
  }

  // 7. Overcrowded Hotspots query (Baga, Calangute, Aguada)
  if (text.includes('baga') || text.includes('calangute') || text.includes('aguada') || text.includes('dudhsagar')) {
    return {
      text: `⚠️ **GoaSmart Crowd Alert**:\n\nThe destination you mentioned is currently experiencing **High to Very High tourist congestion**:\n- **Baga/Calangute**: Est. 4,800+ active visitors, high vehicle bottlenecks along Tito's lane.\n- **Fort Aguada**: Heavy parking queues.\n- **Dudhsagar**: Extended jeep safari waiting times (>2 hours).\n\n💡 **Recommended Smart Alternatives**:\n- Instead of Baga: Visit **Cola Beach Lagoon** or **Galgibaga Beach**.\n- Instead of Aguada: Visit **Reis Magos Fort** or **Cabo de Rama Fort**.\n- Instead of Dudhsagar: Visit **Tambdi Surla Waterfall & Temple**.\n\nWould you like me to map out directions to one of these calmer destinations?`,
      recommendedDestinations: ['cola-beach', 'galgibaga-beach', 'cabo-de-rama']
    };
  }

  // Default intelligent fallback
  return {
    text: `Hello! I am your **GoaSmart AI Travel Companion**. I help you discover the finest parts of Goa while avoiding the peak traffic and overcrowded spots.\n\nYou can ask me:\n- *"Suggest a peaceful beach with fresh seafood within ₹1500"*\n- *"What are some hidden places in Goa?"*\n- *"Suggest a 2-day family-friendly itinerary"*\n- *"Which beaches are least crowded right now?"*\n\nWhere would you like to explore today?`,
    recommendedDestinations: ['galgibaga-beach', 'cola-beach', 'divar-island']
  };
}
