"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBookForm({
  tripId,
  tripTitle
}: {
  tripId: string;
  tripTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(`${tripTitle} Photobook`);
  const [bookType, setBookType] = useState("KMART_6X8");
  const [status, setStatus] = useState("");

  async function handleCreate() {
    setStatus("Creating book...");

    const res = await fetch("/api/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tripId,
        title,
        bookType
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.error || "Failed to create book");
      return;
    }

    setStatus("Book created");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">Create photobook</h2>

      <label className="mt-4 block text-sm font-medium">Book title</label>
      <input
        className="mt-2 w-full rounded-xl border px-3 py-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="mt-4 block text-sm font-medium">Book type</label>
      <select
        className="mt-2 w-full rounded-xl border px-3 py-2"
        value={bookType}
        onChange={(e) => setBookType(e.target.value)}
      >
        <option value="KMART_4X6">Kmart 4x6</option>
        <option value="KMART_6X8">Kmart 6x8</option>
      </select>

      <button onClick={handleCreate} className="mt-4 rounded-xl bg-black px-4 py-2 text-white">
        Create book
      </button>

      {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
    </div>
  );
}
