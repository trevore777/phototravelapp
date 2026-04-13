import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await context.params;
    const kind = req.nextUrl.searchParams.get("kind") || "thumb";

    const photo = await db.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return new NextResponse("Photo not found", { status: 404 });
    }

    const targetPath =
      kind === "original"
        ? photo.storageKey
        : photo.thumbnailKey || photo.storageKey;

    if (!targetPath) {
      return new NextResponse("Image not available", { status: 404 });
    }

    const fileBuffer = await fs.readFile(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(targetPath),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Image route failed:", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
