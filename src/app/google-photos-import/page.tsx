"use client";

import { useState } from "react";

export default function GooglePhotosImportPage() {
  const [tripId, setTripId] = useState("");
  const [filename, setFilename] = useState("google-photo-demo.jpg");
  const [base64, setBase64] = useState("");
  const [status, setStatus] = useState("");

  async function submitDemoImport() {
    setStatus("Importing...");

    const res = await fetch("/api/google-photos/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tripId,
        items: [
          {
            filename,
            imageBase64: base64
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.error || "Import failed");
      return;
    }

    setStatus(
      `Imported ${data.imported}. GPS tagged: ${data.gpsTagged}. Missing GPS: ${data.missingGps}. Thumbnail failures: ${data.thumbnailFailures}.`
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Google Photos import scaffold</h1>
      <p className="mt-2 text-gray-600">
        This page is a developer placeholder. It lets you test the backend import route now,
        and replace it later with a real Google Photos Picker flow.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <label className="block text-sm font-medium">Trip ID</label>
        <input
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="Paste a trip ID"
        />

        <label className="mt-4 block text-sm font-medium">Filename</label>
        <input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="mt-2 w-full rounded-xl border px-3 py-2"
        />

        <label className="mt-4 block text-sm font-medium">Base64 image data</label>
        <textarea
          value={base64}
          onChange={(e) => setBase64(e.target.value)}
          rows={10}
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="Paste raw base64 image data here"
        />

        <button
          onClick={submitDemoImport}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
        >
          Test import
        </button>

        {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
      </div>
    </main>
  );
}
