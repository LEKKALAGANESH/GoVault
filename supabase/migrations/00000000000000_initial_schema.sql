-- ===========================================
-- GoVault - Complete Database Schema
-- ===========================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ===========================================

-- =====================
-- DROP EXISTING TABLES (clean slate)
-- =====================
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS packing_items CASCADE;
DROP TABLE IF EXISTS phrases CASCADE;
DROP TABLE IF EXISTS survival_tips CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS itinerary_days CASCADE;
DROP TABLE IF EXISTS trip_todos CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS travelers CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

DROP FUNCTION IF EXISTS is_trip_owner(UUID);
DROP FUNCTION IF EXISTS update_updated_at();

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- 1. TRIPS
-- =====================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  occasion TEXT,
  destinations TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_total NUMERIC,
  budget_currency TEXT NOT NULL DEFAULT 'INR',
  home_currency TEXT NOT NULL DEFAULT 'INR',
  viewer_link_id TEXT,
  viewer_settings JSONB DEFAULT '{"hide_costs": true, "hide_refs": true, "hide_documents": true, "show_photos": true, "show_ratings": true}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_slug ON trips(slug);

-- =====================
-- 2. TRAVELERS
-- =====================
CREATE TABLE IF NOT EXISTS travelers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ADULT' CHECK (type IN ('ADULT', 'SENIOR', 'CHILD', 'INFANT')),
  age INTEGER,
  email TEXT,
  phone TEXT,
  dietary TEXT[] DEFAULT '{}',
  mobility TEXT,
  notes TEXT,
  is_organizer BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_travelers_trip_id ON travelers(trip_id);
CREATE INDEX IF NOT EXISTS idx_travelers_user_id ON travelers(user_id);

-- =====================
-- 3. BOOKINGS
-- =====================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FLIGHT', 'HOTEL', 'TRANSPORT', 'ACTIVITY')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('CONFIRMED', 'PENDING', 'CANCELLED')),
  confirmation_number TEXT,
  cost NUMERIC,
  currency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Flight fields
  airline TEXT,
  flight_number TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  seats TEXT,

  -- Hotel fields
  hotel_name TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  room_type TEXT,
  address TEXT,

  -- Transport fields
  provider TEXT,
  vehicle_type TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_time TIMESTAMPTZ,

  -- Activity fields
  activity_name TEXT,
  activity_date TIMESTAMPTZ,
  activity_time TEXT,
  venue TEXT
);

CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);

-- =====================
-- 4. ITINERARY DAYS
-- =====================
CREATE TABLE IF NOT EXISTS itinerary_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  summary TEXT,
  energy_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (energy_level IN ('LOW', 'MEDIUM', 'HIGH')),
  location TEXT
);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_itinerary_days_unique ON itinerary_days(trip_id, day_number);

-- =====================
-- 5. ACTIVITIES
-- =====================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  time TEXT,
  end_time TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_url TEXT,
  tips TEXT,
  tags TEXT[] DEFAULT '{}',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  food_recommendations TEXT,
  alternatives JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'TENTATIVE')),
  "order" INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  rating NUMERIC,
  review_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_activities_day_id ON activities(day_id);

-- =====================
-- 6. EXPENSES
-- =====================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  converted_amount NUMERIC,
  category TEXT NOT NULL DEFAULT 'OTHER' CHECK (category IN ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ACTIVITY', 'SHOPPING', 'HEALTH', 'TIPS', 'OTHER')),
  description TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_by_id TEXT,
  split_between TEXT[],
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);

-- =====================
-- 7. DOCUMENTS
-- =====================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  category TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_trip_id ON documents(trip_id);

-- =====================
-- 8. RATINGS
-- =====================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  place_name TEXT NOT NULL,
  place_type TEXT,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  review TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_trip_id ON ratings(trip_id);

-- =====================
-- 9. SURVIVAL TIPS
-- =====================
CREATE TABLE IF NOT EXISTS survival_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  tips TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_survival_tips_trip_id ON survival_tips(trip_id);

-- =====================
-- 10. PHRASES
-- =====================
CREATE TABLE IF NOT EXISTS phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  english TEXT NOT NULL,
  local_text TEXT NOT NULL,
  pronunciation TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_phrases_trip_id ON phrases(trip_id);

-- =====================
-- 11. PACKING ITEMS
-- =====================
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'essentials',
  item TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_packing_items_trip_id ON packing_items(trip_id);

-- =====================
-- 12. EMERGENCY CONTACTS
-- =====================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'emergency',
  label TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_trip_id ON emergency_contacts(trip_id);

-- =====================
-- 13. TRIP TODOS
-- =====================
CREATE TABLE IF NOT EXISTS trip_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'before_trip',
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TEXT,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  link_url TEXT,
  link_text TEXT,
  booking_date TEXT,
  booking_ref TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_trip_todos_trip_id ON trip_todos(trip_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE survival_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_todos ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS Policies: TRIPS
-- =====================
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (owner_id = auth.uid());

-- Viewers can see shared trips
CREATE POLICY "Viewers can see shared trips"
  ON trips FOR SELECT
  USING (viewer_link_id IS NOT NULL);

-- =====================
-- RLS Policies: CHILD TABLES (trip_id based)
-- =====================
-- Helper: check if user owns the trip
CREATE OR REPLACE FUNCTION is_trip_owner(p_trip_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM trips WHERE id = p_trip_id AND owner_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Macro for child table policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'travelers', 'bookings', 'itinerary_days', 'expenses',
      'documents', 'ratings', 'survival_tips', 'phrases',
      'packing_items', 'emergency_contacts', 'trip_todos'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "Owner select on %1$s" ON %1$s FOR SELECT USING (is_trip_owner(trip_id))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Owner insert on %1$s" ON %1$s FOR INSERT WITH CHECK (is_trip_owner(trip_id))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Owner update on %1$s" ON %1$s FOR UPDATE USING (is_trip_owner(trip_id))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "Owner delete on %1$s" ON %1$s FOR DELETE USING (is_trip_owner(trip_id))',
      tbl
    );
  END LOOP;
END $$;

-- Activities are linked via day_id, not trip_id directly
CREATE POLICY "Owner select on activities"
  ON activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM itinerary_days d
    JOIN trips t ON t.id = d.trip_id
    WHERE d.id = activities.day_id AND t.owner_id = auth.uid()
  ));

CREATE POLICY "Owner insert on activities"
  ON activities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM itinerary_days d
    JOIN trips t ON t.id = d.trip_id
    WHERE d.id = activities.day_id AND t.owner_id = auth.uid()
  ));

CREATE POLICY "Owner update on activities"
  ON activities FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM itinerary_days d
    JOIN trips t ON t.id = d.trip_id
    WHERE d.id = activities.day_id AND t.owner_id = auth.uid()
  ));

CREATE POLICY "Owner delete on activities"
  ON activities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM itinerary_days d
    JOIN trips t ON t.id = d.trip_id
    WHERE d.id = activities.day_id AND t.owner_id = auth.uid()
  ));

-- ===========================================
-- AUTO-UPDATE updated_at ON TRIPS
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- STORAGE BUCKET FOR DOCUMENTS
-- ===========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-documents', 'trip-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trip-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own trip documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own trip documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trip-documents' AND auth.role() = 'authenticated');
