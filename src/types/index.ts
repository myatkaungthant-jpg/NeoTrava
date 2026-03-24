export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  description: string;
  start_time: string;
  cost_thb: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  is_verified_tat?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  subtitle?: string;
  total_est_cost_thb: number;
  start_date: string;
  end_date: string;
  user_id: string;
  image_url?: string;
  destination?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  travel_dna?: {
    secluded_luxury?: string;
    cultural_enthusiast?: string;
    adventure_pulse?: number;
    gastronomy_level?: number;
  };
  saved_experiences?: any[];
}
