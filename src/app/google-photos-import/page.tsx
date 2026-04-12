"use client";

import { useEffect, useMemo, useState } from "react";

type DemoItem = {
  filename: string;
  imageBase64: string;
};

export default function GooglePhotosImportPage() {
  const [tripId, setTripId] = useState("");
  const [filename, setFilename] = useState("google-photo-demo.jpg");
  const [base64, setBase64] = useState("");
  const [status, setStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const queryMessage = useMemo(() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") return "Google account connected.";
    if (params.get("error")) return `Google sign-in error: ${params.get("error")}`;
    return "";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/google-photos/session", {
          method: "GET",
          cache: "no-store"
        });

        const data = await res.json();

        if (!cancelled) {
          setConnected(Boolean(data.connected));
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (queryMessage) {
      setStatus(queryMessage);
    }
  }, [queryMessage]);

  async function submitDemoImport() {
    if (!tripId.trim()) {
      setStatus("Paste a trip ID first.");
      return;
    }

    if (!filename.trim() || !base64.trim()) {
      setStatus("Add a filename and base64 image data first.");
      return;
    }

    setStatus("Importing...");

    const items: DemoItem[] = [
      {
        filename: filename.trim(),
        imageBase64: base64.trim()
      }
    ];

    const res = await fetch("/api/google-photos/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tripId: tripId.trim(),
        items
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

  function startGoogleLogin() {
    window.location.href = "/api/auth/google/login";
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">Google Photos import</h1>
      <p className="mt-2 text-gray-600">
        This page now supports Google OAuth connection and a developer import test flow.
        The real Google Photos Picker selection step still needs to be wired after sign-in.
      </p>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Connection</h2>
        <p className="mt-2 text-sm text-gray-600">
          Status:{" "}
          {checkingSession ? "Checking..." : connected ? "Connected" : "Not connected"}
        </p>

        <button
          type="button"
          onClick={startGoogleLogin}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
        >
          {connected ? "Reconnect Google" : "Connect Google"}
        </button>

        <p className="mt-3 text-sm text-gray-600">
          After sign-in, the callback returns here and stores tokens in secure cookies.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Developer test import</h2>
        <p className="mt-2 text-sm text-gray-600">
          Paste a trip ID and raw base64 image data to test the backend import route now.
        </p>

        <label className="mt-4 block text-sm font-medium">Trip ID</label>
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
          placeholder="google-photo-demo.jpg"
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
          type="button"
          onClick={submitDemoImport}
          className="mt-4 rounded-xl border px-4 py-2"
        >
          Test import
        </button>

        {status ? <p className="mt-3 text-sm text-gray-600">{status}</p> : null}
      </section>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Next step</h2>
        <p className="mt-2 text-sm text-gray-600">
          Once Google login is working, replace the developer test area with a real
          Google Photos Picker launcher and pass the selected items into your import route.
        </p>
      </section>
    </main>
  );
}