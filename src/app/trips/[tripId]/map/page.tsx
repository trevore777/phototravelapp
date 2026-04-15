"use client";

import { useEffect, useState } from "react";
import { getTrip, listPhotosForTrip } from "@/lib/local-storage";
import MapRouteClient from "@/components/MapRouteClient";

type Trip = {
  id: string;
  title: string;
  destination?: string;
};

type Point = {
  id: string;
  latitude: number;
  longitude: number;
  takenAt?: string | null;
};

export default function TripMapPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    params.then(async ({ tripId }) => {
      const tripData = await getTrip(tripId);
      const photos = await listPhotosForTrip(tripId);

      setTrip(tripData || null);
      setPoints(
        photos
          .filter((p) => p.latitude != null && p.longitude != null)
          .map((p) => ({
            id: p.id,
            latitude: p.latitude as number,
            longitude: p.longitude as number,
            takenAt: p.takenAt ?? null
          }))
      );
    });
  }, [params]);

  if (!trip) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p>Loading trip map...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">Trip map</h1>
      <p className="mt-2 text-gray-600">
        {trip.title}
        {trip.destination ? ` • ${trip.destination}` : ""}
      </p>

      <div className="mt-6">
        <MapRouteClient points={points} />
      </div>
    </main>
  );
}