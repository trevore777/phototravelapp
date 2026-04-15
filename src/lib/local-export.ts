"use client";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

export type LocalExportPhoto = {
  caption?: string | null;
  dataUrl?: string | null;
  takenAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  orientation?: number | null;
};

export type LocalExportBookInput = {
  title: string;
  subtitle?: string | null;
  photos: LocalExportPhoto[];
  bookType?: "KMART_4X6" | "KMART_6X8";
};

function pageSizeForBook(bookType?: "KMART_4X6" | "KMART_6X8"): [number, number] {
  if (bookType === "KMART_4X6") return [288, 432];
  return [432, 576];
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

function buildCaption(photo: LocalExportPhoto): string {
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

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function normalizeImageDataUrl(
  dataUrl: string,
  orientation?: number | null,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92
): Promise<string> {
  const img = await loadImage(dataUrl);

  const swapSides = [5, 6, 7, 8].includes(orientation ?? 1);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = swapSides ? height : width;
  canvas.height = swapSides ? width : height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  switch (orientation) {
    case 2:
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      break;
  }

  ctx.drawImage(img, 0, 0);

  try {
    return canvas.toDataURL(mimeType, quality);
  } catch {
    return dataUrl;
  }
}

async function buildNormalizedPhoto(photo: LocalExportPhoto): Promise<LocalExportPhoto> {
  if (!photo.dataUrl) return photo;

  try {
    const normalizedDataUrl = await normalizeImageDataUrl(
      photo.dataUrl,
      photo.orientation ?? 1,
      "image/jpeg",
      0.92
    );

    return {
      ...photo,
      dataUrl: normalizedDataUrl,
      orientation: 1
    };
  } catch {
    return photo;
  }
}

async function normalizePhotos(photos: LocalExportPhoto[]): Promise<LocalExportPhoto[]> {
  return Promise.all(photos.map(buildNormalizedPhoto));
}

async function embedDataUrlImage(pdf: PDFDocument, dataUrl: string) {
  const res = await fetch(dataUrl);
  const bytes = await res.arrayBuffer();

  if (dataUrl.startsWith("data:image/png")) {
    return pdf.embedPng(bytes);
  }

  return pdf.embedJpg(bytes);
}

async function buildCoverSvg(input: LocalExportBookInput, width: number, height: number) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#fafafa"/>
  <text x="32" y="70" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111827">
    ${escapeXml(input.title)}
  </text>
  <text x="32" y="100" font-size="12" font-family="Arial, Helvetica, sans-serif" fill="#374151">
    ${escapeXml(input.subtitle ?? "")}
  </text>
</svg>`;
}

async function buildCollageSvg(photos: LocalExportPhoto[], width: number, height: number) {
  const gap = 10;
  const margin = 32;
  const frameWidth = (width - margin * 2 - gap) / 2;
  const frameHeight = 170;
  const top = height - 70;

  const frames = [
    { x: margin, y: top - frameHeight, w: frameWidth, h: frameHeight },
    { x: margin + frameWidth + gap, y: top - frameHeight, w: frameWidth, h: frameHeight },
    { x: margin, y: top - frameHeight * 2 - gap, w: frameWidth, h: frameHeight },
    { x: margin + frameWidth + gap, y: top - frameHeight * 2 - gap, w: frameWidth, h: frameHeight }
  ];

  let images = "";

  for (let i = 0; i < Math.min(4, photos.length); i++) {
    const photo = photos[i];
    const frame = frames[i];

    if (photo.dataUrl) {
      images += `
  <clipPath id="clip${i}">
    <rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}"/>
  </clipPath>
  <image href="${photo.dataUrl}" x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${i})"/>`;
    } else {
      images += `
  <rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" fill="#f3f4f6" stroke="#d1d5db"/>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <text x="32" y="36" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111827">Highlights</text>
  ${images}
</svg>`;
}

async function buildSinglePageSvg(photo: LocalExportPhoto, width: number, height: number, index: number) {
  const caption = escapeXml(buildCaption(photo));
  const imageBox = {
    x: 32,
    y: 120,
    w: width - 64,
    h: height - 200
  };

  let imageMarkup = `<rect x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}" fill="#f9fafb" stroke="#d1d5db"/>`;

  if (photo.dataUrl) {
    imageMarkup = `
  <clipPath id="photoClip">
    <rect x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}"/>
  </clipPath>
  <image href="${photo.dataUrl}" x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}" preserveAspectRatio="xMidYMid meet" clip-path="url(#photoClip)"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <text x="32" y="36" font-size="16" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111827">Photo ${index + 1}</text>
  ${imageMarkup}
  <text x="32" y="${height - 50}" font-size="11" font-family="Arial, Helvetica, sans-serif" fill="#374151">${caption}</text>
</svg>`;
}

export async function downloadLocalBookPdf(input: LocalExportBookInput, filename: string) {
  const normalizedPhotos = await normalizePhotos(input.photos);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const [pageWidth, pageHeight] = pageSizeForBook(input.bookType);

  const cover = pdf.addPage([pageWidth, pageHeight]);
  cover.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.98, 0.98, 0.98)
  });

  cover.drawText(input.title, {
    x: 32,
    y: pageHeight - 70,
    size: 22,
    font: bold,
    maxWidth: pageWidth - 64
  });

  if (input.subtitle) {
    cover.drawText(input.subtitle, {
      x: 32,
      y: pageHeight - 100,
      size: 12,
      font,
      maxWidth: pageWidth - 64
    });
  }

  if (normalizedPhotos.length > 0) {
    const collagePage = pdf.addPage([pageWidth, pageHeight]);
    collagePage.drawText("Highlights", {
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

    for (let i = 0; i < Math.min(4, normalizedPhotos.length); i++) {
      const photo = normalizedPhotos[i];
      const frame = frames[i];

      collagePage.drawRectangle({
        x: frame.x,
        y: frame.y,
        width: frame.w,
        height: frame.h,
        borderWidth: 1,
        color: rgb(0.96, 0.96, 0.96)
      });

      if (photo.dataUrl) {
        try {
          const image = await embedDataUrlImage(pdf, photo.dataUrl);
          const dims = image.scale(1);
          const scale = Math.max(frame.w / dims.width, frame.h / dims.height);
          const drawW = dims.width * scale;
          const drawH = dims.height * scale;
          const drawX = frame.x + (frame.w - drawW) / 2;
          const drawY = frame.y + (frame.h - drawH) / 2;

          collagePage.drawImage(image, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH
          });
        } catch {}
      }
    }
  }

  for (let index = 0; index < normalizedPhotos.length; index++) {
    const photo = normalizedPhotos[index];
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

    if (photo.dataUrl) {
      try {
        const image = await embedDataUrlImage(pdf, photo.dataUrl);
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
      } catch {}
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

  const pdfBytes = await pdf.save();
  const pdfArrayBuffer = toArrayBuffer(pdfBytes);
  downloadBlob(new Blob([pdfArrayBuffer], { type: "application/pdf" }), filename);
}

export async function downloadLocalKmartExport(input: LocalExportBookInput, filename: string) {
  const normalizedPhotos = await normalizePhotos(input.photos);

  const zip = new JSZip();
  const [width, height] = pageSizeForBook(input.bookType);

  zip.file("page-01-cover.svg", await buildCoverSvg(input, width, height));

  if (normalizedPhotos.length > 0) {
    zip.file("page-02-highlights.svg", await buildCollageSvg(normalizedPhotos, width, height));
  }

  for (let i = 0; i < normalizedPhotos.length; i++) {
    const pageNumber = String(i + 3).padStart(2, "0");
    zip.file(
      `page-${pageNumber}.svg`,
      await buildSinglePageSvg(normalizedPhotos[i], width, height, i)
    );
  }

  zip.file(
    "README.txt",
    [
      "Kmart Export Pack",
      "",
      "This ZIP contains page layout SVG files exported from your photobook.",
      "Images were normalized client-side to correct orientation.",
      "",
      "Book type: " + (input.bookType ?? "KMART_6X8")
    ].join("\n")
  );

  const bytes = await zip.generateAsync({ type: "uint8array" });
  const zipArrayBuffer = toArrayBuffer(bytes);
  downloadBlob(new Blob([zipArrayBuffer], { type: "application/zip" }), filename);
}