"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addPhotosToTrip,
  createBook,
  getTrip,
  listBooksForTrip,
  listPhotosForTrip,
  updatePhoto
} from "@/lib/local-storage";

type Photo = {
  id: string;
  filename: string;
  dataUrl: string;
  takenAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  caption?: string;
  note?: string;
  isFavourite: boolean;
  includeInBook: boolean;
};

type Book = {
  id: string;
  title: string;
  bookType: "KMART_4X6" | "KMART_6X8";
};

export default function TripPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookTitle, setBookTitle] = useState("Photobook");
  const [bookType, setBookType] = useState<"KMART_4X6" | "KMART_6X8">("KMART_6X8");
  const [status, setStatus] = useState("");

  useEffect(() => {
    params.then(async ({ tripId }) => {
      setTripId(tripId);
      const tripData = await getTrip(tripId);
      setTrip(tripData);
      setPhotos(await listPhotosForTrip(tripId));
      setBooks(await listBooksForTrip(tripId));
      if (tripData?.title) {
        setBookTitle(`${tripData.title} Photobook`);
      }
    });
  }, [params]);

  async function refreshAll(activeTripId: string) {
    setTrip(await getTrip(activeTripId));
    setPhotos(await listPhotosForTrip(activeTripId));
    setBooks(await listBooksForTrip(activeTripId));
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("files") as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!tripId || files.length === 0) return;

    setStatus("Uploading...");
    await addPhotosToTrip(tripId, files);
    await refreshAll(tripId);
    input.value = "";
    setStatus("Photos uploaded.");
  }

  async function handleSavePhoto(photoId: string, patch: any) {
    await updatePhoto(photoId, patch);
    await refreshAll(tripId);
  }

  async function handleCreateBook() {
    if (!tripId) return;
    await createBook({
      tripId,
      title: bookTitle,
      bookType
    });
    await refreshAll(tripId);
  }

  if (!trip) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p>Loading trip...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <p className="mt-1 text-gray-600">{trip.destination || "No destination set"}</p>
          <p className="mt-1 text-sm text-gray-500">{photos.length} photos</p>
        </div>

        <div className="flex gap-3">
          <Link href={`/trips/${tripId}/map`} className="rounded-xl border px-4 py-2">
            Map
          </Link>
          <Link href={`/trips/${tripId}/book`} className="rounded-xl border px-4 py-2">
            Book
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <form onSubmit={handleUpload} className="rounded-2xl border p-4">
          <h2 className="text-lg font-semibold">Upload trip photos</h2>
          <p className="mt-1 text-sm text-gray-600">
            Photos are stored locally on this device.
          </p>

          <input
            name="files"
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="mt-4 block w-full rounded-xl border p-3"
          />

          <button
            type="submit"
            className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
          >
            Upload photos
          </button>

          {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
        </form>
      </section>

      <section className="mt-8 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Create photobook</h2>

        <label className="mt-4 block text-sm font-medium">Book title</label>
        <input
          className="mt-2 w-full rounded-xl border px-3 py-2"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
        />

        <label className="mt-4 block text-sm font-medium">Book type</label>
        <select
          className="mt-2 w-full rounded-xl border px-3 py-2"
          value={bookType}
          onChange={(e) => setBookType(e.target.value as "KMART_4X6" | "KMART_6X8")}
        >
          <option value="KMART_4X6">Kmart 4x6</option>
          <option value="KMART_6X8">Kmart 6x8</option>
        </select>

        <button
          onClick={handleCreateBook}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
        >
          Create book
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Photos</h2>

        {photos.length === 0 ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm text-gray-600">
            No photos uploaded yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border p-4">
                <div className="mb-4">
                  <div className="mb-4 overflow-hidden rounded-xl border bg-gray-100">
                    <img
                      src={photo.dataUrl}
                      alt={photo.filename}
                      className="h-64 w-full object-cover"
                    />
                  </div>

                  <p className="font-medium">{photo.filename}</p>
                  <p className="text-sm text-gray-500">
                    {photo.takenAt ? new Date(photo.takenAt).toLocaleString() : "No timestamp"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {photo.latitude != null && photo.longitude != null
                      ? `${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`
                      : "No GPS data"}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <h3 className="font-semibold">Edit photo</h3>

                  <label className="mt-4 block text-sm font-medium">Caption</label>
                  <input
                    defaultValue={photo.caption || ""}
                    onBlur={(e) =>
                      handleSavePhoto(photo.id, {
                        caption: e.target.value
                      })
                    }
                    className="mt-2 w-full rounded-xl border px-3 py-2"
                  />

                  <label className="mt-4 block text-sm font-medium">Note</label>
                  <textarea
                    defaultValue={photo.note || ""}
                    rows={4}
                    onBlur={(e) =>
                      handleSavePhoto(photo.id, {
                        note: e.target.value
                      })
                    }
                    className="mt-2 w-full rounded-xl border px-3 py-2"
                  />

                  <div className="mt-4 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        defaultChecked={photo.isFavourite}
                        onChange={(e) =>
                          handleSavePhoto(photo.id, {
                            isFavourite: e.target.checked
                          })
                        }
                      />
                      Favourite
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        defaultChecked={photo.includeInBook}
                        onChange={(e) =>
                          handleSavePhoto(photo.id, {
                            includeInBook: e.target.checked
                          })
                        }
                      />
                      Include in book
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Books</h2>
        {books.length === 0 ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm text-gray-600">
            No books yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {books.map((book) => (
              <div key={book.id} className="rounded-2xl border p-4">
                <p className="font-medium">{book.title}</p>
                <p className="mt-1 text-sm text-gray-500">{book.bookType}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}