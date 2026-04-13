import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";

export type ExportPhoto = {
  caption?: string | null;
  imagePath?: string | null;
  takenAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type ExportBookInput = {
  title: string;
  subtitle?: string | null;
  photos: ExportPhoto[];
  bookType?: "KMART_4X6" | "KMART_6X8";
};

export function pageSizeForBook(bookType?: "KMART_4X6" | "KMART_6X8"): [number, number] {
  if (bookType === "KMART_4X6") return [288, 432];
  return [432, 576];
}

async function embedImage(pdf: PDFDocument, imagePath: string) {
  const bytes = await fs.readFile(imagePath);
  const lower = imagePath.toLowerCase();

  if (lower.endsWith(".png")) {
    return pdf.embedPng(bytes);
  }

  return pdf.embedJpg(bytes);
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatLocation(latitude?: number | null, longitude?: number | null): string | null {
  if (latitude == null || longitude == null) return null;
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function buildCaption(photo: ExportPhoto): string {
  const parts: string[] = [];

  if (photo.caption && photo.caption.trim()) {
    parts.push(photo.caption.trim());
  }

  const dateText = formatDate(photo.takenAt);
  const locationText = formatLocation(photo.latitude, photo.longitude);

  if (dateText) parts.push(dateText);
  if (locationText) parts.push(locationText);

  return parts.join(" • ") || "No caption";
}

async function drawCoverPage(
  pdf: PDFDocument,
  input: ExportBookInput,
  pageWidth: number,
  pageHeight: number
) {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([pageWidth, pageHeight]);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.98, 0.98, 0.98)
  });

  page.drawText(input.title, {
    x: 32,
    y: pageHeight - 70,
    size: 22,
    font: bold,
    maxWidth: pageWidth - 64
  });

  if (input.subtitle) {
    page.drawText(input.subtitle, {
      x: 32,
      y: pageHeight - 100,
      size: 12,
      font,
      maxWidth: pageWidth - 64
    });
  }
}

async function drawCollagePage(
  pdf: PDFDocument,
  photos: ExportPhoto[],
  pageWidth: number,
  pageHeight: number
) {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([pageWidth, pageHeight]);

  page.drawText("Highlights", {
    x: 32,
    y: pageHeight - 36,
    size: 18,
    font: bold
  });

  const top = pageHeight - 70;
  const gap = 10;
  const margin = 32;
  const frameWidth = (pageWidth - margin * 2 - gap) / 2;
  const frameHeight = 170;

  const frames = [
    { x: margin, y: top - frameHeight, w: frameWidth, h: frameHeight },
    { x: margin + frameWidth + gap, y: top - frameHeight, w: frameWidth, h: frameHeight },
    { x: margin, y: top - frameHeight * 2 - gap, w: frameWidth, h: frameHeight },
    { x: margin + frameWidth + gap, y: top - frameHeight * 2 - gap, w: frameWidth, h: frameHeight }
  ];

  for (let i = 0; i < Math.min(4, photos.length); i++) {
    const photo = photos[i];
    const frame = frames[i];

    page.drawRectangle({
      x: frame.x,
      y: frame.y,
      width: frame.w,
      height: frame.h,
      borderWidth: 1,
      color: rgb(0.96, 0.96, 0.96)
    });

    if (photo.imagePath) {
      try {
        const image = await embedImage(pdf, photo.imagePath);
        const dims = image.scale(1);
        const scale = Math.max(frame.w / dims.width, frame.h / dims.height);
        const drawW = dims.width * scale;
        const drawH = dims.height * scale;
        const drawX = frame.x + (frame.w - drawW) / 2;
        const drawY = frame.y + (frame.h - drawH) / 2;

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH
        });
      } catch {
        page.drawText("Preview unavailable", {
          x: frame.x + 12,
          y: frame.y + frame.h / 2,
          size: 10,
          font
        });
      }
    }
  }
}

async function drawSinglePhotoPage(
  pdf: PDFDocument,
  photo: ExportPhoto,
  pageWidth: number,
  pageHeight: number,
  index: number
) {
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([pageWidth, pageHeight]);

  page.drawText(`Photo ${index + 1}`, {
    x: 32,
    y: pageHeight - 36,
    size: 16,
    font: bold
  });

  const imageBox = {
    x: 32,
    y: 120,
    w: pageWidth - 64,
    h: pageHeight - 200
  };

  page.drawRectangle({
    x: imageBox.x,
    y: imageBox.y,
    width: imageBox.w,
    height: imageBox.h,
    borderWidth: 1,
    color: rgb(0.97, 0.97, 0.97)
  });

  if (photo.imagePath) {
    try {
      const image = await embedImage(pdf, photo.imagePath);
      const dims = image.scale(1);
      const scale = Math.min(imageBox.w / dims.width, imageBox.h / dims.height);
      const drawW = dims.width * scale;
      const drawH = dims.height * scale;
      const drawX = imageBox.x + (imageBox.w - drawW) / 2;
      const drawY = imageBox.y + (imageBox.h - drawH) / 2;

      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    } catch {
      page.drawText("Image preview unavailable for PDF", {
        x: imageBox.x + 16,
        y: imageBox.y + imageBox.h / 2,
        size: 11,
        font
      });
    }
  } else {
    page.drawText("No image available", {
      x: imageBox.x + 16,
      y: imageBox.y + imageBox.h / 2,
      size: 11,
      font
    });
  }

  page.drawText(buildCaption(photo), {
    x: 32,
    y: 70,
    size: 11,
    font,
    maxWidth: pageWidth - 64,
    lineHeight: 14
  });
}

export async function buildSimpleBookPdf(input: ExportBookInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const [pageWidth, pageHeight] = pageSizeForBook(input.bookType);

  await drawCoverPage(pdf, input, pageWidth, pageHeight);

  if (input.photos.length > 0) {
    await drawCollagePage(pdf, input.photos, pageWidth, pageHeight);
  }

  for (let index = 0; index < input.photos.length; index++) {
    await drawSinglePhotoPage(pdf, input.photos[index], pageWidth, pageHeight, index);
  }

  return pdf.save();
}