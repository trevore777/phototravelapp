"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

type Point = {
  id: string;
  latitude: number;
  longitude: number;
  takenAt?: string | null;
};

export default function MapRouteClient({ points }: { points: Point[] }) {
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([rl, leaflet]) => {
      const L = leaflet.default;

      // Fix default marker icons (important on Mac / Next)
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
      });

      setLeafletComponents(rl);
    });
  }, []);

  if (!LeafletComponents) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-gray-600">
        Loading map...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polyline, Popup } = LeafletComponents;

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
    <div className="overflow-hidden rounded-2xl border bg-gray-200">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Polyline
          positions={polyline}
          pathOptions={{ color: "red", weight: 5 }}
        />

        {points.map((point, index) => (
          <Marker key={point.id} position={[point.latitude, point.longitude]}>
            <Popup>
              <div>
                <p className="font-semibold">Stop {index + 1}</p>
                <p className="text-xs">
                  {point.takenAt
                    ? new Date(point.takenAt).toLocaleString()
                    : "No time"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}