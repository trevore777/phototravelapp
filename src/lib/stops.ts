import { haversineMeters } from "./geo";

export type StopInput = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: Date | null;
};

export type ComputedStop = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  startTime: Date | null;
  endTime: Date | null;
  photoIds: string[];
  orderIndex: number;
};

export function groupPhotosIntoStops(items: StopInput[]): ComputedStop[] {
  const sorted = [...items].sort((a, b) => {
    const aTime = a.takenAt ? new Date(a.takenAt).getTime() : 0;
    const bTime = b.takenAt ? new Date(b.takenAt).getTime() : 0;
    return aTime - bTime;
  });

  const stops: ComputedStop[] = [];
  let current: ComputedStop | null = null;

  for (const item of sorted) {
    if (!current) {
      current = {
        name: "Stop 1",
        latitude: item.latitude,
        longitude: item.longitude,
        startTime: item.takenAt,
        endTime: item.takenAt,
        photoIds: [item.id],
        orderIndex: 1
      };
      continue;
    }

    const lastLat = current.latitude;
    const lastLng = current.longitude;
    const lastTime = current.endTime?.getTime() ?? 0;
    const thisTime = item.takenAt?.getTime() ?? 0;

    const distance =
      lastLat != null &&
      lastLng != null &&
      item.latitude != null &&
      item.longitude != null
        ? haversineMeters(lastLat, lastLng, item.latitude, item.longitude)
        : Number.POSITIVE_INFINITY;

    const timeGapMinutes = Math.abs(thisTime - lastTime) / 60000;
    const sameStop = distance <= 300 && timeGapMinutes <= 90;

    if (sameStop) {
      current.photoIds.push(item.id);
      current.endTime = item.takenAt;
    } else {
      stops.push(current);
      current = {
        name: `Stop ${stops.length + 2}`,
        latitude: item.latitude,
        longitude: item.longitude,
        startTime: item.takenAt,
        endTime: item.takenAt,
        photoIds: [item.id],
        orderIndex: stops.length + 2
      };
    }
  }

  if (current) {
    stops.push(current);
  }

  return stops;
}
