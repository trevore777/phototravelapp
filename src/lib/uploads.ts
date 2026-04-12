import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { db } from "@/lib/db";
import { parsePhotoMeta } from "@/lib/exif";

export type SavedUploadResult = {
  originalPath: string;
  thumbPath: string | null;
  thumbnailStatus: "created" | "skipped";
  meta: Awaited<ReturnType<typeof parsePhotoMeta>>;
};

export async function savePhotoToLocal({
  bytes,
  originalFilename,
  uploadDir,
  indexHint
}: {
  bytes: Buffer;
  originalFilename: string;
  uploadDir: string;
  indexHint: string;
}): Promise<SavedUploadResult> {
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = originalFilename.replace(/[^\w.\-]+/g, "_");
  const filename = `${Date.now()}-${indexHint}-${safeName}`;
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

  return {
    originalPath,
    thumbPath: createdThumb,
    thumbnailStatus: createdThumb ? "created" : "skipped",
    meta
  };
}

export async function persistPhotoRecord({
  tripId,
  originalFilename,
  storageKey,
  thumbnailKey,
  meta,
  sortOrder
}: {
  tripId: string;
  originalFilename: string;
  storageKey: string;
  thumbnailKey: string | null;
  meta: Awaited<ReturnType<typeof parsePhotoMeta>>;
  sortOrder: number;
}) {
  return db.photo.create({
    data: {
      tripId,
      originalFilename,
      storageKey,
      thumbnailKey,
      takenAt: meta.takenAt ?? null,
      latitude: meta.latitude ?? null,
      longitude: meta.longitude ?? null,
      altitude: meta.altitude ?? null,
      width: meta.width ?? null,
      height: meta.height ?? null,
      orientation: meta.orientation ?? null,
      deviceModel: meta.deviceModel ?? null,
      sortOrder
    }
  });
}
