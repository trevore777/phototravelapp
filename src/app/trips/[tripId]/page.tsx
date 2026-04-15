"use client";

import { useEffect, useMemo, useState } from "react";
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

type Trip = {
  id: string;
  title: string;
  destination?: string;
};

function PhotoCard({
  photo,
  onSave
}: {
  photo: Photo;
  onSave: (
    photoId: string,
    patch: Partial<{
      caption: string;
      note: string;
      isFavourite: boolean;
      includeInBook: boolean;
    }>
  ) => Promise<void>;
}) {
  const [caption, setCaption] = useState(photo.caption || "");
  const [note, setNote] = useState(photo.note || "");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setCaption(photo.caption || "");
    setNote(photo.note || "");
  }, [photo.caption, photo.note]);

  async function saveTextFields() {
    setStatus("Saving...");
    await onSave(photo.id, { caption, note });
    setStatus("Saved");
    setTimeout(() => setStatus(""), 1200);
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50">
        <img
          src={photo.dataUrl}
          alt={photo.filename}
          className="h-72 w-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{photo.filename}</p>
            <p className="mt-1 text-sm text-gray-500">
              {photo.takenAt
                ? new Date(photo.takenAt).toLocaleString()
                : "No timestamp"}
            </p>
            <p className="text-sm text-gray-500">
              {photo.latitude != null && photo.longitude != null
                ? `${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`
                : "No GPS data"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={photo.isFavourite}
                onChange={(e) =>
                  onSave(photo.id, { isFavourite: e.target.checked })
                }
              />
              Favourite
            </label>

            <label className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={photo.includeInBook}
                onChange={(e) =>
                  onSave(photo.id, { includeInBook: e.target.checked })
                }
              />
              Include in book
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={saveTextFields}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveTextFields}
              rows={4}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
            />
          </div>
        </div>

        {status ? <p className="mt-3 text-sm text-gray-500">{status}</p> : null}
      </div>
    </div>
  );
}

export default function TripPage({
  params
}: {
  params: Promise<{ tripId: string }>;
}) {
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookTitle, setBookTitle] = useState("Photobook");
  const [bookType, setBookType] = useState<"KMART_4X6" | "KMART_6X8">("KMART_6X8");
  const [status, setStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    params.then(async ({ tripId }) => {
      setTripId(tripId);
      const tripData = await getTrip(tripId);
      setTrip(tripData || null);
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

  async function uploadFiles(files: File[]) {
    if (!tripId || files.length === 0) return;
    setStatus(`Uploading ${files.length} photo${files.length === 1 ? "" : "s"}...`);
    await addPhotosToTrip(tripId, files);
    await refreshAll(tripId);
    setStatus("Photos uploaded.");
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("files") as HTMLInputElement;
    const files = Array.from(input.files || []);
    await uploadFiles(files);
    input.value = "";
  }

  async function handleSavePhoto(photoId: string, patch: any) {
    await updatePhoto(photoId, patch);
    await refreshAll(tripId);
  }

  async function handleCreateBook() {
    if (!tripId) return;
    setStatus("Creating book...");
    await createBook({
      tripId,
      title: bookTitle,
      bookType
    });
    await refreshAll(tripId);
    setStatus("Book created.");
  }

  const includedCount = useMemo(
    () => photos.filter((p) => p.includeInBook).length,
    [photos]
  );

  if (!trip) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <p>Loading trip...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <section className="rounded-3xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
            <p className="mt-2 text-gray-600">
              {trip.destination || "No destination set"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {photos.length} photos • {includedCount} included in book • {books.length} books
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-2xl border px-4 py-2 text-sm">
              Back
            </Link>
            <Link href={`/trips/${tripId}/map`} className="rounded-2xl border px-4 py-2 text-sm">
              Map
            </Link>
            <Link href={`/trips/${tripId}/book`} className="rounded-2xl border px-4 py-2 text-sm">
              Book
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <form onSubmit={handleUpload} className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Upload photos</h2>
          <p className="mt-2 text-sm text-gray-600">
            Add images directly from your iPhone or laptop. Photos stay on this device.
          </p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDragActive(false);
              const files = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
              );
              await uploadFiles(files);
            }}
            className={`mt-4 block rounded-3xl border-2 border-dashed p-8 text-center transition ${
              dragActive ? "border-black bg-gray-50" : "border-gray-300"
            }`}
          >
            <div className="text-sm text-gray-600">
              Drag and drop photos here, or choose files below
            </div>

            <input
              name="files"
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              className="mt-4 block w-full rounded-2xl border bg-white p-3"
            />
          </label>

          <button
            type="submit"
            className="mt-4 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Upload photos
          </button>
        </form>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Create photobook</h2>
          <p className="mt-2 text-sm text-gray-600">
            Build a local book from the photos marked for inclusion.
          </p>

          <label className="mt-4 block text-sm font-medium text-gray-700">
            Book title
          </label>
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">
            Book type
          </label>
          <select
            className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
            value={bookType}
            onChange={(e) => setBookType(e.target.value as "KMART_4X6" | "KMART_6X8")}
          >
            <option value="KMART_4X6">Kmart 4x6</option>
            <option value="KMART_6X8">Kmart 6x8</option>
          </select>

          <button
            onClick={handleCreateBook}
            className="mt-4 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Create book
          </button>

          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p>{includedCount} photo{includedCount === 1 ? "" : "s"} currently included.</p>
            <p className="mt-1">{books.length} book{books.length === 1 ? "" : "s"} created.</p>
          </div>
        </div>
      </section>

      {status ? (
        <div className="mt-4 rounded-2xl border bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <section className="mt-6">
        <h2 className="text-2xl font-semibold">Photos</h2>

        {photos.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed bg-white p-6 text-sm text-gray-500">
            No photos uploaded yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-6">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onSave={handleSavePhoto} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold">Books</h2>

        {books.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed bg-white p-6 text-sm text-gray-500">
            No books created yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/trips/${tripId}/book`}
                className="rounded-2xl border bg-white p-4 shadow-sm transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{book.bookType}</p>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs text-gray-600">
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}