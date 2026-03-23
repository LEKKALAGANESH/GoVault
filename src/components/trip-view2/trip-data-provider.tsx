"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { TripStats } from "./trip-hero";

// Trip metadata that can be refreshed
interface TripMetadata {
  start_date: string;
  end_date: string;
  name: string;
  destinations: string[];
}

interface TripDataContextValue {
  stats: TripStats | null;
  tripMetadata: TripMetadata | null;
  refreshStats: () => Promise<void>;
  refreshTrip: () => Promise<void>;
  isRefreshing: boolean;
}

const TripDataContext = createContext<TripDataContextValue | null>(null);

// Default value for when used outside provider (e.g., share page)
const defaultContextValue: TripDataContextValue = {
  stats: null,
  tripMetadata: null,
  refreshStats: async () => {},
  refreshTrip: async () => {},
  isRefreshing: false,
};

export function useTripData(): TripDataContextValue {
  const context = useContext(TripDataContext);
  // Return default value if not within provider (allows component reuse in share page)
  return context ?? defaultContextValue;
}

interface TripDataProviderProps {
  tripId: string;
  initialStats: TripStats | null;
  initialTripMetadata?: TripMetadata | null;
  children: ReactNode;
}

export function TripDataProvider({ tripId, initialStats, initialTripMetadata, children }: TripDataProviderProps) {
  const [stats, setStats] = useState<TripStats | null>(initialStats);
  const [tripMetadata, setTripMetadata] = useState<TripMetadata | null>(initialTripMetadata ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [tripId]);

  const refreshTrip = useCallback(async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.trip) {
          setTripMetadata({
            start_date: data.trip.start_date,
            end_date: data.trip.end_date,
            name: data.trip.name,
            destinations: data.trip.destinations || [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to refresh trip metadata:", error);
    }
  }, [tripId]);

  return (
    <TripDataContext.Provider value={{ stats, tripMetadata, refreshStats, refreshTrip, isRefreshing }}>
      {children}
    </TripDataContext.Provider>
  );
}
