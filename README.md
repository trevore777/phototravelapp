# Photo Travel App

Local-first starter scaffold for a travel photo app that:

- imports trip photos
- reads EXIF metadata
- extracts timestamps and GPS
- builds a travel route
- stores notes and captions
- generates a simple photobook PDF
- accepts HEIC / HEIF uploads with safe fallback
- includes Google Photos import scaffolding

## Stack

- Next.js App Router
- TypeScript
- Prisma
- SQLite (local first)
- EXIF: exifr
- Images: sharp
- PDF export: pdf-lib
- Map: Leaflet / React Leaflet

## 1. Install

```bash
npm install
```

## 2. Configure env

Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

## 3. Create database

```bash
npx prisma migrate dev --name init
```

## 4. Run dev server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Notes

- Uploads are stored locally in `tmp_uploads/`.
- HEIC/HEIF files are accepted. If `sharp` cannot render a thumbnail in your environment, the upload still succeeds and the original file is kept.
- Google Photos support in this scaffold is a placeholder flow plus API route stubs. You still need to add real Google OAuth credentials and Picker integration.
- This is ideal for local testing.
- Later, swap local storage to Supabase Storage or S3.

## Main routes

- `/` Home
- `/dashboard`
- `/trips/[tripId]`
- `/trips/[tripId]/map`
- `/trips/[tripId]/book`
- `/google-photos-import`

## API routes

- `GET/POST /api/trips`
- `POST /api/uploads`
- `PATCH /api/photos/[photoId]`
- `POST /api/books`
- `GET /api/export/[bookId]`
- `POST /api/google-photos/import`

## Next recommended upgrade

- Replace local file storage with Supabase Storage
- Add authentication
- Add real Google OAuth + Picker flow
- Add real image rendering to the PDF pages
- Add page layout editor
