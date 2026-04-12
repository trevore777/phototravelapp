import { PDFDocument, StandardFonts } from "pdf-lib";

type ExportPhoto = {
  caption?: string | null;
};

type ExportBookInput = {
  title: string;
  subtitle?: string | null;
  photos: ExportPhoto[];
};

export async function buildSimpleBookPdf(input: ExportBookInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cover = pdf.addPage([432, 576]); // 6x8 at 72 DPI
  cover.drawText(input.title, {
    x: 40,
    y: 500,
    size: 22,
    font: bold
  });

  if (input.subtitle) {
    cover.drawText(input.subtitle, {
      x: 40,
      y: 470,
      size: 12,
      font
    });
  }

  cover.drawText("Travel photobook draft export", {
    x: 40,
    y: 60,
    size: 10,
    font
  });

  input.photos.forEach((photo, index) => {
    const page = pdf.addPage([432, 576]);
    page.drawText(`Photo ${index + 1}`, {
      x: 40,
      y: 520,
      size: 18,
      font: bold
    });

    page.drawRectangle({
      x: 40,
      y: 180,
      width: 352,
      height: 300,
      borderWidth: 1
    });

    page.drawText(photo.caption || "No caption", {
      x: 40,
      y: 140,
      size: 12,
      font,
      maxWidth: 352
    });
  });

  return pdf.save();
}
