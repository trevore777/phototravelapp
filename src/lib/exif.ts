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

export async function parsePhotoMeta(fileBuffer: Buffer): Promise<ParsedPhotoMeta> {
  const data = await exifr.parse(fileBuffer, {
    gps: true,
    tiff: true,
    exif: true,
    ifd0: true
  });

  return {
    takenAt: data?.DateTimeOriginal ?? data?.CreateDate ?? undefined,
    latitude: data?.latitude ?? undefined,
    longitude: data?.longitude ?? undefined,
    altitude: data?.GPSAltitude ?? undefined,
    width: data?.ExifImageWidth ?? data?.ImageWidth ?? undefined,
    height: data?.ExifImageHeight ?? data?.ImageHeight ?? undefined,
    orientation: data?.Orientation ?? undefined,
    deviceModel: data?.Model ?? undefined
  };
}
