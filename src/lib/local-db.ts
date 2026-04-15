import { openDB, DBSchema } from "idb";

export type LocalTrip = {
  id: string;
  title: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type LocalPhoto = {
  id: string;
  tripId: string;
  filename: string;
  mimeType: string;
  dataUrl: string;
  takenAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null;
  width?: number | null;
  height?: number | null;
  orientation?: number | null;
  deviceModel?: string | null;
  caption?: string;
  note?: string;
  isFavourite: boolean;
  includeInBook: boolean;
  createdAt: string;
};

export type LocalBook = {
  id: string;
  tripId: string;
  title: string;
  bookType: "KMART_4X6" | "KMART_6X8";
  createdAt: string;
};

interface TravelDB extends DBSchema {
  trips: {
    key: string;
    value: LocalTrip;
  };
  photos: {
    key: string;
    value: LocalPhoto;
    indexes: {
      "by-trip": string;
    };
  };
  books: {
    key: string;
    value: LocalBook;
    indexes: {
      "by-trip": string;
    };
  };
}

export async function getLocalDb() {
  return openDB<TravelDB>("photo-travel-local-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("trips")) {
        db.createObjectStore("trips", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("photos")) {
        const store = db.createObjectStore("photos", { keyPath: "id" });
        store.createIndex("by-trip", "tripId");
      }

      if (!db.objectStoreNames.contains("books")) {
        const store = db.createObjectStore("books", { keyPath: "id" });
        store.createIndex("by-trip", "tripId");
      }
    }
  });
}

export function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}