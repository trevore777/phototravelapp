import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import path from "path";
import { persistPhotoRecord, savePhotoToLocal } from "@/lib/uploads";

export const runtime = "nodejs";

type GooglePhotoImportItem = {
  filename: string;
  imageBase64: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tripId = typeof body.tripId === "string" ? body.tripId : "";
  const items = Array.isArray(body.items) ? (body.items as GooglePhotoImportItem[]) : [];

  if (!tripId || items.length === 0) {
    return NextResponse.json(
      { error: "tripId and items are required" },
      { status: 400 }
    );
  }

  const trip = await db.trip.findUnique({ where: { id: tripId } });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const uploadDir = path.join(process.cwd(), "tmp_uploads");
  const existingCount = await db.photo.count({ where: { tripId } });

  let imported = 0;
  let gpsTagged = 0;
  let missingGps = 0;
  let thumbnailFailures = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.filename || !item.imageBase64) continue;

    const bytes = Buffer.from(item.imageBase64, "base64");

    const saved = await savePhotoToLocal({
      bytes,
      originalFilename: item.filename,
      uploadDir,
      indexHint: `gphotos-${existingCount + i}`
    });

    if (saved.meta.latitude != null && saved.meta.longitude != null) {
      gpsTagged++;
    } else {
      missingGps++;
    }

    if (saved.thumbnailStatus === "skipped") {
      thumbnailFailures++;
    }

    await persistPhotoRecord({
      tripId,
      originalFilename: item.filename,
      storageKey: saved.originalPath,
      thumbnailKey: saved.thumbPath,
      meta: saved.meta,
      sortOrder: existingCount + i
    });

    imported++;
  }

  return NextResponse.json({
    imported,
    gpsTagged,
    missingGps,
    thumbnailFailures,
    note: "This route is ready for a real Google Photos Picker or OAuth flow."
  });
}
