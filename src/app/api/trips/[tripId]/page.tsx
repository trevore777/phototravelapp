
export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function TripPage(
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      photos: { orderBy: { takenAt: "asc" } },
      books: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) return notFound();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <p className="text-gray-600">{trip.destination || "No destination set"}</p>
        </div>

        <div className="flex gap-3">
          <Link href={`/trips/${trip.id}/map`} className="rounded-xl border px-4 py-2">
            Map
          </Link>
          <Link href={`/trips/${trip.id}/book`} className="rounded-xl border px-4 py-2">
            Book
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Photos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {trip.photos.map((photo) => (
            <div key={photo.id} className="rounded-xl border p-3">
              <p className="truncate font-medium">{photo.originalFilename}</p>
              <p className="mt-1 text-sm text-gray-500">
                {photo.takenAt ? new Date(photo.takenAt).toLocaleString() : "No timestamp"}
              </p>
              <p className="text-sm text-gray-500">
                {photo.latitude != null && photo.longitude != null
                  ? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`
                  : "No GPS"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Books</h2>
        <div className="mt-4 space-y-3">
          {trip.books.map((book) => (
            <div key={book.id} className="rounded-xl border p-3">
              <p className="font-medium">{book.title}</p>
              <p className="text-sm text-gray-500">{book.bookType}</p>
              <a
                href={`/api/export/${book.id}`}
                className="mt-2 inline-block text-sm underline"
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}