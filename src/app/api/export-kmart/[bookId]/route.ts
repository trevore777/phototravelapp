import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildKmartExportZip } from "@/lib/export-kmart";

export async function GET(
  _req: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await context.params;

  const book = await db.bookProject.findUnique({
    where: { id: bookId },
    include: {
      trip: {
        include: {
          photos: {
            orderBy: [{ takenAt: "asc" }, { createdAt: "asc" }]
          }
        }
      },
      pages: { orderBy: { pageNumber: "asc" } }
    }
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const photoMap = new Map(book.trip.photos.map((photo) => [photo.id, photo]));

  const photos = book.pages
    .filter((page) => page.layoutType === "single-photo")
    .map((page) => {
      const data = page.pageJson as {
        photoId?: string;
        caption?: string | null;
      };

      const photo = data.photoId ? photoMap.get(data.photoId) : null;

      return {
        caption: data.caption ?? photo?.caption ?? null,
        imagePath: photo?.thumbnailKey || null,
        takenAt: photo?.takenAt ? photo.takenAt.toISOString() : null,
        latitude: photo?.latitude ?? null,
        longitude: photo?.longitude ?? null
      };
    });

  const zipBytes = await buildKmartExportZip({
    title: book.coverTitle || book.title,
    subtitle: book.coverSubtitle,
    photos,
    bookType: book.bookType === "KMART_4X6" ? "KMART_4X6" : "KMART_6X8"
  });

  return new NextResponse(zipBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${book.title}-kmart-export.zip"`
    }
  });
}