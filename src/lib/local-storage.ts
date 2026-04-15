import * as exifr from "exifr";
import { getLocalDb, LocalBook, LocalPhoto, LocalTrip, makeId } from "./local-db";

function normalizeOrientation(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) return value;

  if (typeof value === "string") {
    const map: Record<string, number> = {
      "Horizontal (normal)": 1,
      "Mirror horizontal": 2,
      "Rotate 180": 3,
      "Mirror vertical": 4,
      "Mirror horizontal and rotate 270 CW": 5,
      "Rotate 90 CW": 6,
      "Mirror horizontal and rotate 90 CW": 7,
      "Rotate 270 CW": 8
    };
    return map[value];
  }

  return undefined;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createTrip(input: {
  title: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}) {
  const db = await getLocalDb();

  const trip: LocalTrip = {
    id: makeId("trip"),
    title: input.title,
    destination: input.destination || "",
    startDate: input.startDate || "",
    endDate: input.endDate || "",
    createdAt: new Date().toISOString()
  };

  await db.put("trips", trip);
  return trip;
}

export async function listTrips() {
  const db = await getLocalDb();
  const trips = await db.getAll("trips");
  return trips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTrip(tripId: string) {
  const db = await getLocalDb();
  return db.get("trips", tripId);
}

export async function listPhotosForTrip(tripId: string) {
  const db = await getLocalDb();
  const photos = await db.getAllFromIndex("photos", "by-trip", tripId);
  return photos.sort((a, b) => {
    const aTime = a.takenAt || a.createdAt;
    const bTime = b.takenAt || b.createdAt;
    return aTime.localeCompare(bTime);
  });
}

export async function listBooksForTrip(tripId: string) {
  const db = await getLocalDb();
  const books = await db.getAllFromIndex("books", "by-trip", tripId);
  return books.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addPhotosToTrip(tripId: string, files: File[]) {
  const db = await getLocalDb();

  const created: LocalPhoto[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const data: any = await exifr.parse(bytes).catch(() => ({}));
    const dataUrl = await fileToDataUrl(file);

    const photo: LocalPhoto = {
      id: makeId("photo"),
      tripId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      dataUrl,
      takenAt: data?.DateTimeOriginal
        ? new Date(data.DateTimeOriginal).toISOString()
        : data?.CreateDate
          ? new Date(data.CreateDate).toISOString()
          : null,
      latitude: data?.latitude ?? null,
      longitude: data?.longitude ?? null,
      altitude: data?.GPSAltitude ?? null,
      width: data?.ExifImageWidth ?? data?.ImageWidth ?? null,
      height: data?.ExifImageHeight ?? data?.ImageHeight ?? null,
      orientation: normalizeOrientation(data?.Orientation) ?? null,
      deviceModel: data?.Model ?? null,
      caption: "",
      note: "",
      isFavourite: false,
      includeInBook: true,
      createdAt: new Date().toISOString()
    };

    await db.put("photos", photo);
    created.push(photo);
  }

  return created;
}

export async function updatePhoto(
  photoId: string,
  patch: Partial<Pick<LocalPhoto, "caption" | "note" | "isFavourite" | "includeInBook">>
) {
  const db = await getLocalDb();
  const photo = await db.get("photos", photoId);
  if (!photo) throw new Error("Photo not found");

  const updated: LocalPhoto = {
    ...photo,
    ...patch
  };

  await db.put("photos", updated);
  return updated;
}

export async function createBook(input: {
  tripId: string;
  title: string;
  bookType: "KMART_4X6" | "KMART_6X8";
}) {
  const db = await getLocalDb();

  const book: LocalBook = {
    id: makeId("book"),
    tripId: input.tripId,
    title: input.title,
    bookType: input.bookType,
    createdAt: new Date().toISOString()
  };

  await db.put("books", book);
  return book;
}