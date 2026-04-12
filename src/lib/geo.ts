export type RoutePoint = {
  id: string;
  latitude: number;
  longitude: number;
  takenAt?: Date | null;
};

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildGeoJson(points: RoutePoint[]) {
  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: valid.map((p) => [p.longitude, p.latitude])
        },
        properties: {
          kind: "route"
        }
      },
      ...valid.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          id: p.id,
          takenAt: p.takenAt?.toISOString() ?? null
        }
      }))
    ]
  };
}
