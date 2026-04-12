export type LayoutType = "cover" | "single-photo" | "two-photo" | "map-page";

export function chooseLayout(photoCount: number): LayoutType {
  if (photoCount <= 1) return "single-photo";
  if (photoCount === 2) return "two-photo";
  return "single-photo";
}
