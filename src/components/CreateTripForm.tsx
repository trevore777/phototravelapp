"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTripForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        destination,
        startDate,
        endDate
      })
    });

    const data = await res.json();

    setIsSaving(false);

    if (!res.ok) {
      setError(data?.error || "Failed to create trip");
      return;
    }

    router.push(`/trips/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">Create a new trip</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Trip title</label>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Japan 2026"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Destination</label>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Tokyo, Kyoto, Osaka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Start date</label>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">End date</label>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSaving ? "Creating..." : "Create trip"}
      </button>
    </form>
  );
}
