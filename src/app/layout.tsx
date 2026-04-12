import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Travel App",
  description: "Simple travel route builder and photobook export app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold">
              Photo Travel App
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
