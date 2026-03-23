-- Update flight bookings for Thailand trip with actual ticket details
-- Flight data extracted from booking screenshots

DO $$
DECLARE
  thailand_trip_id UUID;
BEGIN
  SELECT id INTO thailand_trip_id FROM trips WHERE slug = 'thailand-2026-2026' LIMIT 1;

  IF thailand_trip_id IS NOT NULL THEN
    DELETE FROM bookings WHERE trip_id = thailand_trip_id AND type = 'FLIGHT';

    INSERT INTO bookings (trip_id, type, status, airline, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, confirmation_number, seats)
    VALUES
      -- Outbound: Hyderabad -> Phuket (Air India Express)
      (thailand_trip_id, 'FLIGHT', 'CONFIRMED', 'Air India Express', 'IX 938', 'HYD', 'HKT', '2026-02-28T06:10:00+05:30', '2026-02-28T11:40:00+07:00', 'UVD9XR', '2D, 2E, 2F'),
      -- Internal: Phuket -> Bangkok Don Mueang (Nok Air)
      (thailand_trip_id, 'FLIGHT', 'CONFIRMED', 'Nok Air', 'DD525', 'HKT', 'DMK', '2026-03-04T11:30:00+07:00', '2026-03-04T13:00:00+07:00', '1Q162L', NULL),
      -- Return: Bangkok -> Hyderabad (IndiGo)
      (thailand_trip_id, 'FLIGHT', 'CONFIRMED', 'IndiGo', '6E-1068', 'BKK', 'HYD', '2026-03-07T17:10:00+07:00', '2026-03-07T19:35:00+05:30', 'ZF7GUH', NULL);
  END IF;
END $$;
