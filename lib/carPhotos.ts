// Branded studio shots that exist in /public/assets/cars but aren't (yet) set as
// the car's imageUrl in the admin. Keyed by "Brand Model".
const STUDIO_PHOTOS: Record<string, string> = {
  "Peugeot Traveller": "/assets/cars/Peugeot Traveller Automatic.png",
  "Fiat Ducato L3H2": "/assets/cars/Fiat_Ducato_L3H2.png",
  "Fiat Ducato L3H2 Plus": "/assets/cars/Fiat_Ducato_L3H2.png",
  "Fiat Ducato L4H2": "/assets/cars/Fiat_Ducato_L4H2.png",
  "Hyundai Ioniq Elektro": "/assets/cars/Hyundai Ioniq Elektro.png",
  "VW Golf Kombi": "/assets/cars/VW_Golf_Kombi.png",
};

// Rent-Ex branded studio shots (1536×672, logo on the door).
export const BRANDED_PHOTOS = new Set([
  "/assets/cars/Ford_Mustang_MachE_GT.png",
  "/assets/cars/Peugeot Traveller Automatic.png",
  "/assets/cars/Fiat_Ducato_L3H2.png",
  "/assets/cars/Fiat_Ducato_L4H2.png",
  "/assets/cars/Hyundai Ioniq Elektro.png",
  "/assets/cars/OpelCorsa.png",
  "/assets/cars/Seat_Leon_Kombi.png",
  "/assets/cars/Skoda_Superb_Kombi.png",
  "/assets/cars/VWPolo.png",
  "/assets/cars/VW_Golf_Kombi.png",
]);

export function carPhoto(brand: string, model: string, imageUrl: string | null): string | null {
  return STUDIO_PHOTOS[`${brand} ${model}`] ?? imageUrl;
}

export function carSlug(brand: string, model: string) {
  return `${brand}-${model}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}
