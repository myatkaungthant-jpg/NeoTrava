-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables (Idempotent)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  total_est_cost_thb DECIMAL(10, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT,
  cost_thb DECIMAL(10, 2) DEFAULT 0,
  location_name TEXT,
  image_url TEXT,
  is_verified_tat BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  travel_dna JSONB DEFAULT '{}'::jsonb,
  saved_experiences JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Safe Column Additions (for existing tables)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='user_id') THEN
        ALTER TABLE trips ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. RLS (Row Level Security)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Secure Policies (User-Specific access)
DO $$ 
BEGIN
    -- DROP existing permissive policies if they exist (clean up)
    DROP POLICY IF EXISTS "Allow public read access to trips" ON trips;
    DROP POLICY IF EXISTS "Allow public read access to activities" ON activities;
    DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
    DROP POLICY IF EXISTS "Allow public read access" ON trips;
    DROP POLICY IF EXISTS "Allow public read access" ON activities;
    DROP POLICY IF EXISTS "Allow public read access" ON profiles;
    DROP POLICY IF EXISTS "Users can only see their own trips" ON trips;
    DROP POLICY IF EXISTS "Users can only see activities of their own trips" ON activities;
    DROP POLICY IF EXISTS "Users can only see their own profile" ON profiles;

    -- Create Secure Policies
    CREATE POLICY "Users can only see their own trips" ON trips 
      FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can only see activities of their own trips" ON activities 
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM trips 
          WHERE trips.id = activities.trip_id 
          AND trips.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can only see their own profile" ON profiles 
      FOR ALL USING (auth.uid() = id);

END $$;
