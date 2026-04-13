# Photo Travel App — Simple Version (Preview Fixed)

This version keeps the app simple and fixes image preview issues.

It does these core things:

- create a trip
- upload photos directly from iPhone or laptop
- read EXIF metadata where available
- extract timestamps and GPS where available
- build a travel route on a map
- add notes and captions to each photo
- create a simple photobook record
- export a simple PDF photobook
- show image previews through a local image route

## Supported uploads

Typical supported formats:
- JPG / JPEG
- PNG
- WEBP
- HEIC / HEIF

Important:
- JPG / PNG / WEBP generate normal previews
- HEIC / HEIF still upload and save correctly
- HEIC / HEIF preview generation may be skipped if your local environment cannot render them cleanly
- if preview generation is skipped, the app still works and shows a placeholder instead of a black image

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
