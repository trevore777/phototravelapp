import JSZip from "jszip";
import fs from "fs/promises";
import { ExportBookInput, ExportPhoto, pageSizeForBook } from "./export-pdf";

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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function imageToDataUri(imagePath: string): Promise<string> {
  const bytes = await fs.readFile(imagePath);
  const lower = imagePath.toLowerCase();
  const mime = lower.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function buildCoverSvg(input: ExportBookInput, width: number, height: number) {
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

async function buildCollageSvg(photos: ExportPhoto[], width: number, height: number) {
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

    if (photo.imagePath) {
      try {
        const uri = await imageToDataUri(photo.imagePath);
        images += `
  <clipPath id="clip${i}">
    <rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="0" ry="0"/>
  </clipPath>
  <image href="${uri}" x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${i})"/>`;
      } catch {
        images += `
  <rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" fill="#f3f4f6" stroke="#d1d5db"/>
  <text x="${frame.x + 12}" y="${frame.y + frame.h / 2}" font-size="10" font-family="Arial, Helvetica, sans-serif" fill="#6b7280">Preview unavailable</text>`;
      }
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

async function buildSinglePageSvg(photo: ExportPhoto, width: number, height: number, index: number) {
  const caption = escapeXml(buildCaption(photo));
  const imageBox = {
    x: 32,
    y: 120,
    w: width - 64,
    h: height - 200
  };

  let imageMarkup = `<rect x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}" fill="#f9fafb" stroke="#d1d5db"/>`;

  if (photo.imagePath) {
    try {
      const uri = await imageToDataUri(photo.imagePath);
      imageMarkup = `
  <clipPath id="photoClip">
    <rect x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}"/>
  </clipPath>
  <image href="${uri}" x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}" preserveAspectRatio="xMidYMid meet" clip-path="url(#photoClip)"/>`;
    } catch {
      imageMarkup = `
  <rect x="${imageBox.x}" y="${imageBox.y}" width="${imageBox.w}" height="${imageBox.h}" fill="#f9fafb" stroke="#d1d5db"/>
  <text x="${imageBox.x + 16}" y="${imageBox.y + imageBox.h / 2}" font-size="11" font-family="Arial, Helvetica, sans-serif" fill="#6b7280">Image preview unavailable</text>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <text x="32" y="36" font-size="16" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111827">Photo ${index + 1}</text>
  ${imageMarkup}
  <text x="32" y="${height - 50}" font-size="11" font-family="Arial, Helvetica, sans-serif" fill="#374151">${caption}</text>
</svg>`;
}

export async function buildKmartExportZip(input: ExportBookInput): Promise<Uint8Array> {
  const zip = new JSZip();
  const [width, height] = pageSizeForBook(input.bookType);

  zip.file("page-01-cover.svg", await buildCoverSvg(input, width, height));

  if (input.photos.length > 0) {
    zip.file("page-02-highlights.svg", await buildCollageSvg(input.photos, width, height));
  }

  for (let i = 0; i < input.photos.length; i++) {
    const pageNumber = String(i + 3).padStart(2, "0");
    zip.file(
      `page-${pageNumber}.svg`,
      await buildSinglePageSvg(input.photos[i], width, height, i)
    );
  }

  zip.file(
    "README.txt",
    [
      "Kmart Export Pack",
      "",
      "This ZIP contains page layout files exported from your photobook.",
      "Use these as layout references or convert them to raster JPG/PNG if needed.",
      "",
      "Book type: " + (input.bookType ?? "KMART_6X8")
    ].join("\n")
  );

  return zip.generateAsync({ type: "uint8array" });
}