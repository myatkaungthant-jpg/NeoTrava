import { GoogleGenAI } from "@google/genai";
import { Activity } from "@/types";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

// Helper to fetch valid TAT venues to seed Gemini with exact context
export async function fetchTATPlaces(destination: string, limit = 40) {
  try {
    const response = await fetch(`/tat-api/api/v2/places?keyword=${encodeURIComponent(destination)}&limit=${limit}`, {
      headers: {
        'x-api-key': import.meta.env.VITE_TAT_API_KEY,
        'Accept-Language': 'en'
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.warn("Failed to fetch TAT places", error);
    return [];
  }
}

export interface GeneratedItinerary {
  title: string;
  subtitle: string;
  strategy: string; // The geographic plan (e.g., Day 1 North, Day 2 South)
  activities: Partial<Activity>[];
}

export const generateItinerary = async (
  destination: string,
  subDestinations: string[],
  startDate: string,
  endDate: string,
  travelers: number,
  budget: number,
  experiences: string[]
): Promise<GeneratedItinerary> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Combine destination and sub-destinations for the AI prompt
  const fullDestination = subDestinations.length > 0 
    ? `${destination} (${subDestinations.join(', ')})` 
    : destination;

  // Optimize keyword for TAT - prioritize sub-destinations if they exist
  const searchKeyword = subDestinations.length > 0 ? subDestinations[0] : destination;
  let optimizedKeyword = searchKeyword.replace(/province|city|region/gi, '').trim();
  let tatPlaces = await fetchTATPlaces(optimizedKeyword);
  
  if (tatPlaces.length === 0 && optimizedKeyword !== destination) {
    console.log(`No results for ${optimizedKeyword}, trying fallback: ${destination}`);
    tatPlaces = await fetchTATPlaces(destination);
  }
  
  console.log(`Fetched ${tatPlaces.length} TAT verified venues for ${optimizedKeyword}`);
  
  const tatContextStrings = tatPlaces.map((p: any) => 
    `- ${p.place_name} (${p.category_description}): ${p.location?.address || ""}, ${p.location?.province || ""}, lat: ${p.latitude || "N/A"}, lng: ${p.longitude || "N/A"}`
  ).slice(0, 40).join('\n');

  const prompt = `
    CRITICAL INSTRUCTION - GEOGRAPHIC EFFICIENCY & SEQUENCING:
    - **Logistics First**: Before generating activities, mentally define a "Daily Focus Area" for each day. Start at one end of the destination and move progressively towards the other.
    - **Backtracking is Forbidden**: Do not schedule a venue in the North, then one in the South, then another in the North on the same day.
    - **Cluster-Based Planning**: Day 1 should focus on Area A, Day 2 on Area B, etc.
    - **Mental Check**: Use the provided latitude/longitude in the TAT context below to verify distance. If two spots are more than 30km apart, do not schedule them back-to-back unless it's a dedicated transit morning/afternoon.
    
    You are an expert luxury travel concierge. Create a detailed, day-by-day itinerary for a trip to ${fullDestination}.
    The trip is from ${startDate} to ${endDate} (Total: ${duration} days), for ${travelers} travelers.
    The total budget for this trip must be strictly under ${budget} THB.
    
    CRITICAL INSTRUCTION - THEMED EXPERIENCES:
    The user highlighted the following preferred experiences: [${experiences.length > 0 ? experiences.join(', ') : 'General luxury, relaxed pace'}].
    You MUST heavily center the itinerary venues and activities around these exact themes.
    
    CRITICAL CONTEXT (TAT DATABASE):
    You MUST prioritize venues from the following verified Tourism Authority of Thailand database if available.
    Use their EXACT names for "location_name" so our geocoding service can find them accurately.
    ${tatContextStrings ? tatContextStrings : "No TAT data available. Rely on internal knowledge."}
    
    CRITICAL INSTRUCTION - RESPONSE FORMAT:
    Return a single JSON object with this exact structure:
    {
      "title": "A unique, evocative trip title (4-6 words).",
      "subtitle": "A short tagline (under 10 words) summarizing the trip vibe.",
      "strategy": "A 1-2 sentence explanation of your GEOGRAPHIC PLAN (e.g., 'Day 1: Mae Sai border cluster; Day 2: Doi Tung mountains; Day 3: Chiang Saen riverside').",
      "activities": [
        {
          "title": "Activity Name (can be creative/evocative)",
          "description": "A 1-2 sentence summary.",
          "location_name": "MUST be a REAL, SPECIFIC, SEARCHABLE venue name (see rules below)",
          "start_time": "Day X, HH:MM AM/PM",
          "cost_thb": estimated cost as number,
          "is_verified_tat": true/false
        }
      ]
    }

    🚨 CRITICAL LOCATION NAME RULES (READ CAREFULLY):
    The "location_name" field is sent directly to Google Maps Geocoding. It MUST be a real, specific place that Google Maps can find.
    
    ❌ BAD location_name examples (NEVER do this):
    - "Journey to the Golden Triangle" (this is a description, not a place)
    - "Doi Tung Local Market & Mountain Vistas" (too vague, combines two things)
    - "Mae Sai Border Exploration" (this is an activity name, not a place)
    - "Chiang Saen Riverside Relaxation" (not a real venue)
    - "Golden Triangle" (too generic, Google Maps won't know which spot)
    
    ✅ GOOD location_name examples (ALWAYS do this):
    - "Hall of Opium Museum, Chiang Saen, Chiang Rai"
    - "Wat Phra That Doi Wao, Mae Sai, Chiang Rai"
    - "Mae Sai Border Market, Mae Sai, Chiang Rai"
    - "Mae Fah Luang Garden, Doi Tung, Chiang Rai"
    - "Wat Phra That Chedi Luang, Chiang Saen, Chiang Rai"
    
    RULE: Every "location_name" must be a SPECIFIC temple, museum, market, restaurant, park, or landmark that exists on Google Maps. Include district and province. If you cannot name a specific venue, use the nearest well-known landmark.
    Each activity MUST have a DIFFERENT, UNIQUE location_name. No two activities should geocode to the same point.
    
    CRITICAL DISTANCE RULE: All activities on the same day MUST be within a 15km radius of each other to avoid "going back and forth". If two locations are far apart, they MUST be on different days.
    
    CRITICAL INSTRUCTION: Generate activities spread across all ${duration} days. The "start_time" field MUST literally start with the day number, for example "Day 1, 09:00 AM" or "Day 2, 02:00 PM".
    CRITICAL INSTRUCTION: Do NOT provide latitude or longitude fields. We geocode "location_name" separately.
    
    Ensure there are 2-4 activities per day. The "title" field can be creative and evocative (e.g., "Sacred Hilltop Serenity"), but the "location_name" MUST always be a real, specific venue.
    Do not use markdown formatting outside of the JSON block. Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    const parsed = JSON.parse(resultText);

    // Handle various JSON wrapper formats
    let rawActivities = [];
    if (Array.isArray(parsed)) {
      rawActivities = parsed;
    } else if (parsed.activities && Array.isArray(parsed.activities)) {
      rawActivities = parsed.activities;
    } else if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
      rawActivities = parsed.itinerary;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      rawActivities = parsed.data;
    }

    return {
      title: parsed.title || parsed.itinerary?.title || `Curated ${destination} Escape`,
      subtitle: parsed.subtitle || parsed.itinerary?.subtitle || "Thailand",
      strategy: parsed.strategy || parsed.itinerary?.strategy || "Curated geographic route.",
      activities: rawActivities as Partial<Activity>[],
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};
