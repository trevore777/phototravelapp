"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  photoId: string;
  initialCaption: string;
  initialNote: string;
  initialFavourite: boolean;
  initialIncludeInBook: boolean;
};

export default function PhotoEditor(props: Props) {
  const router = useRouter();
  const [caption, setCaption] = useState(props.initialCaption);
  const [note, setNote] = useState(props.initialNote);
  const [isFavourite, setIsFavourite] = useState(props.initialFavourite);
  const [includeInBook, setIncludeInBook] = useState(props.initialIncludeInBook);
  const [status, setStatus] = useState("");

  async function save() {
    setStatus("Saving...");

    const res = await fetch(`/api/photos/${props.photoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caption,
        note,
        isFavourite,
        includeInBook
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.error || "Save failed");
      return;
    }

    setStatus("Saved");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold">Edit photo</h3>

      <label className="mt-4 block text-sm font-medium">Caption</label>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mt-2 w-full rounded-xl border px-3 py-2"
      />

      <label className="mt-4 block text-sm font-medium">Note</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="mt-2 w-full rounded-xl border px-3 py-2"
      />

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFavourite}
            onChange={(e) => setIsFavourite(e.target.checked)}
          />
          Favourite
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInBook}
            onChange={(e) => setIncludeInBook(e.target.checked)}
          />
          Include in book
        </label>
      </div>

      <button onClick={save} className="mt-4 rounded-xl bg-black px-4 py-2 text-white">
        Save changes
      </button>

      {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
    </div>
  );
}
