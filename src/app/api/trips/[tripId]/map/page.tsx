export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import MapRouteClient from "@/components/MapRouteClient";

export default async function TripMapPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      photos: {
        orderBy: [{ takenAt: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!trip) return notFound();

  const points = trip.photos
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      latitude: p.latitude as number,
      longitude: p.longitude as number,
      takenAt: p.takenAt ? p.takenAt.toISOString() : null
    }));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">Trip map</h1>
      <p className="mt-2 text-gray-600">
        Route is drawn using GPS-tagged photos in chronological order.
      </p>

      <div className="mt-6">
        <MapRouteClient points={points} />
      </div>
    </main>
  );
}