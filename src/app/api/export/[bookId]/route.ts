import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSimpleBookPdf } from "@/lib/export-pdf";

export async function GET(
  _req: Request,
  context: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await context.params;

  const book = await db.bookProject.findUnique({
    where: { id: bookId },
    include: {
      trip: true,
      pages: { orderBy: { pageNumber: "asc" } }
    }
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const pdfBytes = await buildSimpleBookPdf({
    title: book.coverTitle || book.title,
    subtitle: book.coverSubtitle,
    photos: book.pages
      .filter((page) => page.layoutType === "single-photo")
      .map((page) => {
        const data = page.pageJson as { caption?: string | null };
        return {
          caption: data.caption ?? null
        };
      })
  });

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${book.title}.pdf"`
    }
  });
}
