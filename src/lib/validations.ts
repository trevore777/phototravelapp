import { z } from "zod";

export const createTripSchema = z.object({
  title: z.string().min(1).max(120),
  destination: z.string().max(120).optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal(""))
});

export const createBookSchema = z.object({
  tripId: z.string().min(1),
  title: z.string().min(1).max(120),
  bookType: z.enum(["KMART_4X6", "KMART_6X8"])
});

export const updatePhotoSchema = z.object({
  caption: z.string().max(2000).nullable().optional(),
  note: z.string().max(5000).nullable().optional(),
  isFavourite: z.boolean().optional(),
  includeInBook: z.boolean().optional()
});
