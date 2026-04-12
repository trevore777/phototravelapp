"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadPhotosForm({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!files || files.length === 0) {
      setStatus("Choose one or more images first.");
      return;
    }

    const formData = new FormData();
    formData.append("tripId", tripId);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setIsUploading(false);

    if (!res.ok) {
      setStatus(data?.error || "Upload failed.");
      return;
    }

    setStatus(
      `Uploaded ${data.uploaded} photos. GPS tagged: ${data.gpsTagged}. Missing GPS: ${data.missingGps}. Thumbnail failures: ${data.thumbnailFailures}. Skipped: ${(data.skippedFiles || []).join(", ") || "None"}.`
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">Upload trip photos</h2>
      <p className="mt-1 text-sm text-gray-600">
        This local-first version stores uploaded files in <code>tmp_uploads/</code>. Accepted formats: JPG, PNG, WEBP, HEIC, HEIF.
      </p>

      <input
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="mt-4 block w-full rounded-xl border p-3"
        onChange={(e) => setFiles(e.target.files)}
      />

      <button
        type="submit"
        disabled={isUploading}
        className="mt-4 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload photos"}
      </button>

      {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
    </form>
  );
}
