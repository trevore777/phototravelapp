import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createTripSchema } from "@/lib/validations";

export async function GET() {
  const trips = await db.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { photos: true, books: true }
      }
    }
  });

  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createTripSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid trip payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const trip = await db.trip.create({
    data: {
      title: parsed.data.title,
      destination: parsed.data.destination || null,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null
    }
  });

  return NextResponse.json(trip, { status: 201 });
}
