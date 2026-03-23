// Core Types for GoVault

export type TripStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type MemberRole = 'OWNER' | 'CO_PLANNER' | 'VIEWER';

export type TravelerType = 'ADULT' | 'SENIOR' | 'CHILD' | 'INFANT';

export type BookingType = 'FLIGHT' | 'HOTEL' | 'TRANSPORT' | 'ACTIVITY';

export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export type ExpenseCategory =
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'ACTIVITY'
  | 'SHOPPING'
  | 'HEALTH'
  | 'TIPS'
  | 'OTHER';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Date;
}

export interface Trip {
  id: string;
  slug: string;
  name: string;
  occasion?: string;
  destinations: string[];
  start_date: Date;
  end_date: Date;
  cover_image?: string;
  status: TripStatus;
  owner_id: string;
  budget_total?: number;
  budget_currency: string;
  home_currency: string;
  viewer_link_id?: string;
  viewer_settings?: ViewerSettings;
  created_at: Date;
  updated_at: Date;
}

export interface ViewerSettings {
  hide_costs: boolean;
  hide_refs: boolean;
  hide_documents: boolean;
  show_photos: boolean;
  show_ratings: boolean;
}

export interface Traveler {
  id: string;
  trip_id: string;
  user_id?: string; // Links to auth.users - if set, email comes from user account
  name: string;
  type: TravelerType;
  age?: number;
  email?: string;
  phone?: string;
  dietary: string[];
  mobility?: string;
  notes?: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: Date;
  title: string;
  summary?: string;
  energy_level: EnergyLevel;
  location?: string;
}

export interface Activity {
  id: string;
  day_id: string;
  time?: string;
  end_time?: string;
  title: string;
  description?: string;
  location?: string;
  location_url?: string;
  tips?: string;
  tags: string[];
  booking_id?: string;
  food_recommendations?: string;
  alternatives?: RestaurantAlternative[];
  status: 'CONFIRMED' | 'TENTATIVE';
  order: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
}

export interface RestaurantAlternative {
  name: string;
  cuisine: string;
  description?: string;
  tags: string[];
  price_level?: string;
  map_url?: string;
}

export interface Booking {
  id: string;
  trip_id: string;
  type: BookingType;
  status: BookingStatus;
  confirmation_number?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  created_at: Date;

  // Flight specific
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: Date;
  arrival_time?: Date;
  seats?: string;

  // Hotel specific
  hotel_name?: string;
  check_in?: Date;
  check_out?: Date;
  room_type?: string;
  address?: string;

  // Transport specific
  provider?: string;
  vehicle_type?: string;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_time?: Date;

  // Activity specific
  activity_name?: string;
  activity_date?: Date;
  activity_time?: string;
  venue?: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  amount: number;
  currency: string;
  converted_amount?: number;
  category: ExpenseCategory;
  description?: string;
  date: Date;
  paid_by_id: string;
  split_between?: string[];
  receipt_url?: string;
  created_at: Date;
}

export interface Document {
  id: string;
  trip_id: string;
  booking_id?: string;
  name: string;
  file_url: string;
  file_type: string;
  category?: string;
  uploaded_at: Date;
}

export interface Rating {
  id: string;
  trip_id: string;
  activity_id?: string;
  place_name: string;
  place_type?: string;
  rating: number;
  tags: string[];
  review?: string;
  photos?: string[];
  created_at: Date;
}

// Trip Soul Features

export interface SurvivalTip {
  id: string;
  trip_id: string;
  category: string;
  title: string;
  tips: string[];
  order: number;
}

export interface Phrase {
  id: string;
  trip_id: string;
  english: string;
  local_text: string;
  pronunciation?: string;
  order: number;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  category: string;
  item: string;
  checked: boolean;
  order: number;
}

export interface EmergencyContact {
  id: string;
  trip_id: string;
  category: string;
  label: string;
  phone?: string;
  address?: string;
  notes?: string;
  order: number;
}

export type TodoPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TripTodo {
  id: string;
  trip_id: string;
  category: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority?: TodoPriority;
  link_url?: string;
  link_text?: string;
  booking_date?: string;
  booking_ref?: string;
  order: number;
}

// Extended trip with all relations
export interface TripWithExtras extends Trip {
  travelers?: Traveler[];
  bookings?: Booking[];
  itinerary_days?: (ItineraryDay & { activities?: Activity[] })[];
  survival_tips?: SurvivalTip[];
  phrases?: Phrase[];
  packing_items?: PackingItem[];
  emergency_contacts?: EmergencyContact[];
  trip_todos?: TripTodo[];
}
