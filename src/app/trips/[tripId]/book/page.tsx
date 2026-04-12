import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TripBookPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      books: {
        orderBy: { createdAt: "desc" },
        include: {
          pages: { orderBy: { pageNumber: "asc" } }
        }
      }
    }
  });

  if (!trip) return notFound();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">Book builder</h1>
      <p className="mt-2 text-gray-600">
        This starter scaffold creates a simple draft book structure and PDF export.
      </p>

      <div className="mt-6 space-y-4">
        {trip.books.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-gray-600">
            No books created yet. Go back to the trip page and create one.
          </div>
        ) : (
          trip.books.map((book) => (
            <div key={book.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{book.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {book.bookType} · {book.pageCount} pages
                  </p>
                </div>
                <a
                  href={`/api/export/${book.id}`}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  Download PDF
                </a>
              </div>

              <div className="mt-4 space-y-2">
                {book.pages.map((page) => (
                  <div key={page.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                    Page {page.pageNumber} · {page.layoutType}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <Link href={`/trips/${trip.id}`} className="underline">
          Back to trip
        </Link>
      </div>
    </main>
  );
}
