import { supabase } from "@/lib/supabase";
import { Activity, Trip } from "@/types";

export async function getTrips(): Promise<Trip[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trips:", error);
    return [];
  }

  return data as Trip[];
}

export async function getTripById(id: string): Promise<Trip | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching trip by ID:", error);
    return null;
  }

  return data as Trip;
}

export async function getActivities(tripId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", tripId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data as Activity[];
}

export async function getProfile(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, profile: any): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Error updating profile:", error);
  }
}

export async function createTrip(trip: Partial<Trip>): Promise<{ trip: Trip | null, error?: string }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth error:", authError);
    return { trip: null, error: `Authentication failed: ${authError.message}. Try signing in again.` };
  }
  if (!user) {
    return { trip: null, error: "You must be signed in to save a trip." };
  }

  const { data, error } = await supabase
    .from("trips")
    .insert([{ ...trip, user_id: user.id }])
    .select()
    .single();

  if (error) {
    // Resilient fallback for missing columns
    if (
      error.message?.includes("destination") || 
      error.message?.includes("subtitle") || 
      error.message?.includes("start_date") || 
      error.message?.includes("end_date")
    ) {
      console.warn("Retrying createTrip with minimal fields (schema mismatch):", error.message);
      const minimalTrip = { 
        title: trip.title || "Curated Journey", 
        user_id: user.id 
      };
      
      const { data: retryData, error: retryError } = await supabase
        .from("trips")
        .insert([minimalTrip])
        .select()
        .single();

      if (retryError) {
        console.error("Error creating trip (retry):", retryError);
        return { trip: null, error: `Database error: ${retryError.message}` };
      }
      return { trip: retryData as Trip };
    }
    
    console.error("Error creating trip:", error);
    return { trip: null, error: `Database error: ${error.message}` };
  }

  return { trip: data as Trip };
}

export async function createActivity(activity: Partial<Activity>): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .insert([activity])
    .select()
    .single();

  if (error) {
    // If the error is about missing latitude/longitude columns, retry without them
    if (error.message?.includes("latitude") || error.message?.includes("longitude")) {
      console.warn("Retrying createActivity without coordinates (columns may not exist yet):", error.message);
      const { latitude, longitude, ...activityWithoutCoords } = activity as any;
      const { data: retryData, error: retryError } = await supabase
        .from("activities")
        .insert([activityWithoutCoords])
        .select()
        .single();

      if (retryError) {
        console.error("Error creating activity (retry):", retryError);
        return null;
      }
      return retryData as Activity;
    }
    console.error("Error creating activity:", error);
    return null;
  }

  return data as Activity;
}

export async function deleteTrip(tripId: string): Promise<boolean> {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId);

  if (error) {
    console.error("Error deleting trip:", error);
    return false;
  }

  return true;
}
