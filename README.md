# Photo Travel App — Simple Version

This is the simplified version of the app.

It does only these core things:

- create a trip
- upload photos directly from iPhone or laptop
- read EXIF metadata where available
- extract timestamps and GPS where available
- build a travel route on a map
- add notes and captions to each photo
- create a simple photobook record
- export a simple PDF photobook

## Supported uploads

This version is designed for direct file uploads only.

Typical supported formats:
- JPG / JPEG
- PNG
- WEBP
- HEIC / HEIF (accepted, but preview generation depends on local image codec support)

If a HEIC/HEIF preview cannot be created in your environment:
- the upload still succeeds
- the original photo is still saved
- the app still works

## Local setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Main routes

- `/`
- `/dashboard`
- `/trips/[tripId]`
- `/trips/[tripId]/map`
- `/trips/[tripId]/book`

## API routes

- `GET/POST /api/trips`
- `POST /api/uploads`
- `PATCH /api/photos/[photoId]`
- `POST /api/books`
- `GET /api/export/[bookId]`

## Notes

- uploads are stored locally in `tmp_uploads/`
- database is local SQLite
- this version is best for local testing first
