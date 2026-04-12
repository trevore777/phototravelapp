"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

type Point = {
  id: string;
  latitude: number;
  longitude: number;
  takenAt?: string | null;
};

export default function MapRouteClient({ points }: { points: Point[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-gray-600">
        No GPS-tagged photos yet.
      </div>
    );
  }

  const center: [number, number] = [points[0].latitude, points[0].longitude];
  const polyline: [number, number][] = points.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="overflow-hidden rounded-2xl border">
      <MapContainer center={center} zoom={6} style={{ height: 500, width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={polyline} />
        {points.map((point, index) => (
          <Marker key={point.id} position={[point.latitude, point.longitude]}>
            <Popup>
              <div>
                <p className="font-semibold">Stop {index + 1}</p>
                <p className="text-xs">
                  {point.takenAt ? new Date(point.takenAt).toLocaleString() : "No time"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
