import { seedDatabase } from "./seed";

let hasChecked = false;

export async function ensureDataSeeded() {
  if (hasChecked) return;
  try {
    await seedDatabase();
    hasChecked = true;
  } catch (err) {
    console.error("Error ensuring data is seeded:", err);
  }
}
