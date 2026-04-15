"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createTrip, listTrips } from "@/lib/local-storage";

type Trip = {
  id: string;
  title: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
};

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  async function refreshTrips() {
    const data = await listTrips();
    setTrips(data);
  }

  useEffect(() => {
    refreshTrips();
  }, []);

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setStatus("Creating trip...");

    await createTrip({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate
    });

    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setStatus("Trip created.");

    refreshTrips();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <section className="rounded-3xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Photo Travel App
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
          Create a trip, upload photos from your device, build a route from photo metadata,
          and export a photobook — all stored locally on this device.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
        <form
          onSubmit={handleCreateTrip}
          className="rounded-3xl border bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Create a new trip</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trip title
              </label>
              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none ring-0 transition focus:border-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Japan 2026"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Tokyo, Kyoto, Osaka"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start date
                </label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End date
                </label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Create trip
          </button>

          {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
        </form>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your trips</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              {trips.length} total
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {trips.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500">
                No trips yet. Create your first trip on the left.
              </div>
            ) : (
              trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="rounded-2xl border p-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{trip.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {trip.destination || "No destination"}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {trip.startDate || "No start date"}
                        {trip.endDate ? ` → ${trip.endDate}` : ""}
                      </p>
                    </div>

                    <span className="rounded-full border px-3 py-1 text-xs text-gray-600">
                      Open
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}