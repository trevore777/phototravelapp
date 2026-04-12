import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-bold">Simple Photo Travel App</h1>
      <p className="mt-4 max-w-3xl text-gray-600">
        Upload photos directly from your iPhone or laptop, map the trip from photo metadata,
        add notes, and export a simple photobook PDF.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/dashboard" className="rounded-xl bg-black px-4 py-2 text-white">
          Open dashboard
        </Link>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">1. Create a trip</h2>
          <p className="mt-2 text-sm text-gray-600">Set up the trip title and destination.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">2. Upload photos</h2>
          <p className="mt-2 text-sm text-gray-600">Choose images straight from your device.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">3. Add notes</h2>
          <p className="mt-2 text-sm text-gray-600">Write captions and notes for each photo.</p>
        </div>
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">4. Export photobook</h2>
          <p className="mt-2 text-sm text-gray-600">Generate a simple PDF photobook.</p>
        </div>
      </section>
    </main>
  );
}
