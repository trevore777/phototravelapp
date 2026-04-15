"use client";

import { useState } from "react";
import { listPhotosForTrip } from "@/lib/local-storage";
import { downloadLocalBookPdf, downloadLocalKmartExport } from "@/lib/local-export";

export default function LocalBookExportButtons({
  tripId,
  tripTitle,
  destination,
  bookId,
  bookTitle,
  bookType
}: {
  tripId: string;
  tripTitle: string;
  destination?: string;
  bookId: string;
  bookTitle: string;
  bookType: "KMART_4X6" | "KMART_6X8";
}) {
  const [status, setStatus] = useState("");

  async function loadExportPhotos() {
    const allPhotos = await listPhotosForTrip(tripId);

    return allPhotos
      .filter((photo) => photo.includeInBook)
      .map((photo) => ({
        caption: photo.caption ?? "",
        dataUrl: photo.dataUrl,
        takenAt: photo.takenAt ?? null,
        latitude: photo.latitude ?? null,
        longitude: photo.longitude ?? null
      }));
  }

  async function handlePdf() {
    try {
      setStatus("Building PDF...");
      const photos = await loadExportPhotos();

      await downloadLocalBookPdf(
        {
          title: tripTitle || bookTitle,
          subtitle: destination || "",
          photos,
          bookType
        },
        `${bookTitle}.pdf`
      );

      setStatus("PDF downloaded.");
    } catch (error) {
      console.error(error);
      setStatus("PDF export failed.");
    }
  }

  async function handleKmart() {
    try {
      setStatus("Building Kmart export...");
      const photos = await loadExportPhotos();

      await downloadLocalKmartExport(
        {
          title: tripTitle || bookTitle,
          subtitle: destination || "",
          photos,
          bookType
        },
        `${bookTitle}-kmart-export.zip`
      );

      setStatus("Kmart export downloaded.");
    } catch (error) {
      console.error(error);
      setStatus("Kmart export failed.");
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePdf}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={handleKmart}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Download Kmart export
        </button>
      </div>

      {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
    </div>
  );
}