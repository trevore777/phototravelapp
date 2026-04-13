import * as exifr from "exifr";

export type ParsedPhotoMeta = {
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  width?: number;
  height?: number;
  orientation?: number;
  deviceModel?: string;
};

function normalizeOrientation(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const map: Record<string, number> = {
      "Horizontal (normal)": 1,
      "Mirror horizontal": 2,
      "Rotate 180": 3,
      "Mirror vertical": 4,
      "Mirror horizontal and rotate 270 CW": 5,
      "Rotate 90 CW": 6,
      "Mirror horizontal and rotate 90 CW": 7,
      "Rotate 270 CW": 8
    };

    return map[value] ?? undefined;
  }

  return undefined;
}

export async function parsePhotoMeta(fileBuffer: Buffer): Promise<ParsedPhotoMeta> {
  try {
    const data: any = await exifr.parse(fileBuffer);

    return {
      takenAt: data?.DateTimeOriginal || data?.CreateDate,
      latitude: data?.latitude,
      longitude: data?.longitude,
      altitude: data?.GPSAltitude,
      width: data?.ExifImageWidth || data?.ImageWidth,
      height: data?.ExifImageHeight || data?.ImageHeight,
      orientation: normalizeOrientation(data?.Orientation),
      deviceModel: data?.Model
    };
  } catch (err) {
    console.error("EXIF parse failed:", err);
    return {};
  }
}
