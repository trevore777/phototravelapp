import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updatePhotoSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await context.params;
  const body = await req.json();
  const parsed = updatePhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid photo payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await db.photo.findUnique({ where: { id: photoId } });

  if (!existing) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const photo = await db.photo.update({
    where: { id: photoId },
    data: {
      caption: parsed.data.caption ?? existing.caption,
      note: parsed.data.note ?? existing.note,
      isFavourite:
        typeof parsed.data.isFavourite === "boolean"
          ? parsed.data.isFavourite
          : existing.isFavourite,
      includeInBook:
        typeof parsed.data.includeInBook === "boolean"
          ? parsed.data.includeInBook
          : existing.includeInBook
    }
  });

  return NextResponse.json(photo);
}
