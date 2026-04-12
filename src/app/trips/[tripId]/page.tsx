import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import UploadPhotosForm from "@/components/UploadPhotosForm";
import PhotoEditor from "@/components/PhotoEditor";
import CreateBookForm from "@/components/CreateBookForm";
import { groupPhotosIntoStops } from "@/lib/stops";

export default async function TripPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      photos: { orderBy: [{ takenAt: "asc" }, { createdAt: "asc" }] },
      books: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!trip) return notFound();

  const stops = groupPhotosIntoStops(
    trip.photos.map((photo) => ({
      id: photo.id,
      latitude: photo.latitude,
      longitude: photo.longitude,
      takenAt: photo.takenAt
    }))
  );

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <p className="mt-1 text-gray-600">{trip.destination || "No destination set"}</p>
          <p className="mt-1 text-sm text-gray-500">
            {trip.photos.length} photos · {stops.length} computed stops
          </p>
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
        <UploadPhotosForm tripId={trip.id} />
        <p className="mt-3 text-sm text-gray-600">
          You can also use the Google Photos import scaffold page and paste this trip ID there.
        </p>
      </section>

      <section className="mt-8">
        <CreateBookForm tripId={trip.id} tripTitle={trip.title} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Photos</h2>

        {trip.photos.length === 0 ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm text-gray-600">
            No photos uploaded yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {trip.photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border p-4">
                <div className="mb-4">
                  <p className="font-medium">{photo.originalFilename}</p>
                  <p className="text-sm text-gray-500">
                    {photo.takenAt ? new Date(photo.takenAt).toLocaleString() : "No timestamp"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {photo.latitude != null && photo.longitude != null
                      ? `${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`
                      : "No GPS data"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {photo.thumbnailKey ? "Thumbnail ready" : "No thumbnail preview generated"}
                  </p>
                </div>

                <PhotoEditor
                  photoId={photo.id}
                  initialCaption={photo.caption || ""}
                  initialNote={photo.note || ""}
                  initialFavourite={photo.isFavourite}
                  initialIncludeInBook={photo.includeInBook}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Books</h2>
        {trip.books.length === 0 ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm text-gray-600">
            No books yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {trip.books.map((book) => (
              <div key={book.id} className="rounded-2xl border p-4">
                <p className="font-medium">{book.title}</p>
                <p className="mt-1 text-sm text-gray-500">{book.bookType}</p>
                <a
                  href={`/api/export/${book.id}`}
                  className="mt-3 inline-block text-sm underline"
                >
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
