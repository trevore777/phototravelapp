import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBookSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createBookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid book payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const trip = await db.trip.findUnique({
    where: { id: parsed.data.tripId },
    include: {
      photos: {
        where: { includeInBook: true },
        orderBy: [{ takenAt: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const book = await db.bookProject.create({
    data: {
      tripId: trip.id,
      title: parsed.data.title,
      bookType: parsed.data.bookType,
      pageCount: Math.max(2, trip.photos.length + 1),
      coverTitle: trip.title,
      coverSubtitle: trip.destination ?? null,
      pages: {
        create: [
          {
            pageNumber: 1,
            layoutType: "cover",
            pageJson: {
              title: trip.title,
              subtitle: trip.destination
            }
          },
          ...trip.photos.map((photo, index) => ({
            pageNumber: index + 2,
            layoutType: "single-photo",
            pageJson: {
              photoId: photo.id,
              caption: photo.caption,
              filename: photo.originalFilename
            }
          }))
        ]
      }
    },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" }
      }
    }
  });

  return NextResponse.json(book, { status: 201 });
}
