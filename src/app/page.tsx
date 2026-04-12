import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-bold">Turn phone photos into a mapped travel journal</h1>
      <p className="mt-4 max-w-3xl text-gray-600">
        Import trip photos, read timestamps and GPS metadata, build a route on a map,
        add notes, and export a simple photobook PDF.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-xl bg-black px-4 py-2 text-white">
          Open dashboard
        </Link>
        <Link href="/google-photos-import" className="rounded-xl border px-4 py-2">
          Google Photos import scaffold
        </Link>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">1. Create a trip</h2>
          <p className="mt-2 text-sm text-gray-600">Add destination, dates, and organise photos by trip.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">2. Upload photos</h2>
          <p className="mt-2 text-sm text-gray-600">Extract EXIF metadata including timestamps and GPS coordinates.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">3. HEIC / HEIF safe fallback</h2>
          <p className="mt-2 text-sm text-gray-600">Uploads continue even when thumbnail rendering is unavailable.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">4. Google Photos ready</h2>
          <p className="mt-2 text-sm text-gray-600">Includes the scaffolding needed for a later Picker integration.</p>
        </div>
      </section>
    </main>
  );
}
