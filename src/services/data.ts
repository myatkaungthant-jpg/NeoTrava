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

export async function createTrip(trip: Partial<Trip>): Promise<Trip | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("trips")
    .insert([{ ...trip, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating trip:", error);
    return null;
  }

  return data as Trip;
}

export async function createActivity(activity: Partial<Activity>): Promise<Activity | null> {
  const { data, error } = await supabase
    .from("activities")
    .insert([activity])
    .select()
    .single();

  if (error) {
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
