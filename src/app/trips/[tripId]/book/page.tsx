"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTrip, listBooksForTrip } from "@/lib/local-storage";
import LocalBookExportButtons from "@/components/LocalBookExportButtons";

type Trip = {
  id: string;
  title: string;
  destination?: string;
};

type Book = {
  id: string;
  title: string;
  bookType: "KMART_4X6" | "KMART_6X8";
  createdAt: string;
};

export default function TripBookPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    params.then(async ({ tripId }) => {
      setTripId(tripId);
      setTrip((await getTrip(tripId)) || null);
      setBooks(await listBooksForTrip(tripId));
    });
  }, [params]);

  if (!trip) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p>Loading book page...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold">Book builder</h1>
      <p className="mt-2 text-gray-600">
        Create and download your trip book locally from this device.
      </p>

      <div className="mt-6 space-y-4">
        {books.length === 0 ? (
          <div className="rounded-2xl border p-4 text-sm text-gray-600">
            No books created yet. Go back to the trip page and create one.
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{book.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {book.bookType}
                  </p>
                </div>

                <LocalBookExportButtons
                  tripId={tripId}
                  tripTitle={trip.title}
                  destination={trip.destination}
                  bookId={book.id}
                  bookTitle={book.title}
                  bookType={book.bookType}
                />
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