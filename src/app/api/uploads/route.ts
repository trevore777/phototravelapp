import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parsePhotoMeta } from "@/lib/exif";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

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
  await fs.mkdir(uploadDir, { recursive: true });

  let gpsTagged = 0;
  let missingGps = 0;

  const existingCount = await db.photo.count({ where: { tripId } });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = getExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.name}` },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const filename = `${Date.now()}-${i}-${safeName}`;
    const originalPath = path.join(uploadDir, filename);
    const thumbPath = path.join(uploadDir, `thumb-${filename}.jpg`);

    await fs.writeFile(originalPath, bytes);

    let createdThumb: string | null = null;
    try {
      await sharp(bytes)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toFile(thumbPath);
      createdThumb = thumbPath;
    } catch {
      createdThumb = null;
    }

    const meta = await parsePhotoMeta(bytes);

    if (meta.latitude != null && meta.longitude != null) {
      gpsTagged++;
    } else {
      missingGps++;
    }

    await db.photo.create({
      data: {
        tripId,
        originalFilename: file.name,
        storageKey: originalPath,
        thumbnailKey: createdThumb,
        takenAt: meta.takenAt ?? null,
        latitude: meta.latitude ?? null,
        longitude: meta.longitude ?? null,
        altitude: meta.altitude ?? null,
        width: meta.width ?? null,
        height: meta.height ?? null,
        orientation: meta.orientation ?? null,
        deviceModel: meta.deviceModel ?? null,
        sortOrder: existingCount + i
      }
    });
  }

  return NextResponse.json({
    uploaded: files.length,
    gpsTagged,
    missingGps
  });
}
