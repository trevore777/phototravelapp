-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "destination" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "coverPhotoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "stopId" TEXT,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "takenAt" DATETIME,
    "latitude" REAL,
    "longitude" REAL,
    "altitude" REAL,
    "width" INTEGER,
    "height" INTEGER,
    "orientation" INTEGER,
    "deviceModel" TEXT,
    "caption" TEXT,
    "note" TEXT,
    "isFavourite" BOOLEAN NOT NULL DEFAULT false,
    "includeInBook" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Photo_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Photo_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "orderIndex" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bookType" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "coverTitle" TEXT,
    "coverSubtitle" TEXT,
    "exportStatus" TEXT NOT NULL DEFAULT 'draft',
    "exportKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookProject_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookProjectId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "layoutType" TEXT NOT NULL,
    "pageJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookPage_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
