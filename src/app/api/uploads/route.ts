import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import path from "path";
import { persistPhotoRecord, savePhotoToLocal } from "@/lib/uploads";

export const runtime = "nodejs";

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

function getExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const tripId = formData.get("tripId")?.toString();
  const files = formData.getAll("files") as File[];

  if (!tripId || files.length === 0) {
    return NextResponse.json(
      { error: "tripId and one or more files are required" },
      { status: 400 }
    );
  }

  const trip = await db.trip.findUnique({ where: { id: tripId } });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const uploadDir = path.join(process.cwd(), "tmp_uploads");
  let gpsTagged = 0;
  let missingGps = 0;
  let thumbnailFailures = 0;
  const skippedFiles: string[] = [];

  const existingCount = await db.photo.count({ where: { tripId } });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = getExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      skippedFiles.push(file.name);
      continue;
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const saved = await savePhotoToLocal({
      bytes,
      originalFilename: file.name,
      uploadDir,
      indexHint: String(existingCount + i)
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
      originalFilename: file.name,
      storageKey: saved.originalPath,
      thumbnailKey: saved.thumbPath,
      meta: saved.meta,
      sortOrder: existingCount + i
    });
  }

  return NextResponse.json({
    uploaded: files.length - skippedFiles.length,
    gpsTagged,
    missingGps,
    thumbnailFailures,
    skippedFiles
  });
}
