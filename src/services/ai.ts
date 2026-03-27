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

export const generateItinerary = async (
  destination: string,
  subDestinations: string[],
  startDate: string,
  endDate: string,
  travelers: number,
  budget: number,
  experiences: string[]
): Promise<Partial<Activity>[]> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Combine destination and sub-destinations for the AI prompt
  const fullDestination = subDestinations.length > 0 
    ? `${destination} (${subDestinations.join(', ')})` 
    : destination;

  // Optimize keyword for TAT - use the primary destination (province)
  const optimizedKeyword = destination.split(' ')[0].replace('&', '');
  const tatPlaces = await fetchTATPlaces(optimizedKeyword);
  console.log(`Fetched ${tatPlaces.length} TAT verified venues for ${optimizedKeyword}`);
  
  const tatContextStrings = tatPlaces.map((p: any) => 
    `- ${p.place_name} (${p.category_description}): ${p.location?.address || ""}, ${p.location?.province || ""}`
  ).slice(0, 30).join('\n'); // Top 30 venues for context

  const prompt = `
    CRITICAL INSTRUCTION - GEOGRAPHIC EFFICIENCY & SEQUENCING:
    - **Logical Progression**: The itinerary MUST follow a logical geographic route (e.g., North to South, East to West, or a sensible loop). Avoid "zig-zagging" or backtracking between distant locations.
    - **Clustering**: Group activities that are geographically close to each other on the same day to minimize travel time.
    - **Travel Awareness**: Account for transit time. Do not schedule distant activities on the same day unless it is a necessary travel day.
    - **Area Focus**: If specific districts or sub-destinations are mentioned (${subDestinations.join(', ')}), prioritize activities within those exact clusters.
    
    You are an expert luxury travel concierge. Create a detailed, day-by-day itinerary for a trip to ${fullDestination}.
    The trip is from ${startDate} to ${endDate} (Total: ${duration} days), for ${travelers} travelers.
    The total budget for this trip must be strictly under ${budget} THB.
    
    CRITICAL INSTRUCTION - THEMED EXPERIENCES:
    The user highlighted the following preferred experiences: [${experiences.length > 0 ? experiences.join(', ') : 'General luxury, relaxed pace'}].
    You MUST heavily center the itinerary venues and activities around these exact themes.
    
    CRITICAL CONTEXT (TAT DATABASE):
    You MUST prioritize venues from the following verified Tourism Authority of Thailand database if available. 
    If you select a venue from this list, you MUST copy its exact 'lat' and 'lng' into your generated latitude and longitude fields.
    ${tatContextStrings ? tatContextStrings : "No TAT data available. Rely on internal knowledge."}
    
    Return a JSON array of activity objects exactly matching this structure (do not include the root 'Trip' object, just the activities):
    [
      {
        "title": "Activity Name",
        "description": "A 1-2 sentence detailed summary of this place/activity. Mention specific highlights, architecture, or why it matches the selected experiences. Mention why this location makes sense in the current day's sequence.",
        "location_name": "Specific location or neighborhood (MUST be the exact name from TAT database if used, include province)",
        "cost_thb": estimated cost in THB (number),
        "is_verified_tat": true/false
      }
    ]
    
    CRITICAL INSTRUCTION: Generate activities spread across all ${duration} days. The "start_time" field MUST literally start with the day number, for example "Day 1, 09:00 AM" or "Day 2, 02:00 PM".
    
    Ensure there are 2-4 activities per day. Make the activities sound premium and curated, matching a 'Digital Curator' vibe.
    Do not use markdown formatting outside of the JSON block. Return ONLY the JSON array.
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
    
    const activities = JSON.parse(resultText) as Partial<Activity>[];
    return activities;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};
