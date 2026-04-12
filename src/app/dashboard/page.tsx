import { db } from "@/lib/db";
import CreateTripForm from "@/components/CreateTripForm";
import Link from "next/link";

export default async function DashboardPage() {
  const trips = await db.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { photos: true, books: true }
      }
    }
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Create trips, upload photos, map the route, and build a photobook.
      </p>

      <div className="mt-8">
        <CreateTripForm />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Trips</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {trips.length === 0 ? (
            <div className="rounded-2xl border p-4 text-sm text-gray-600">
              No trips yet. Create your first trip above.
            </div>
          ) : (
            trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="rounded-2xl border p-4 transition hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold">{trip.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{trip.destination || "No destination"}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {trip._count.photos} photos · {trip._count.books} books
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
