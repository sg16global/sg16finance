import { seedDatabase } from "./seed";

async function main() {
  try {
    console.log("Seeding SG16 Finance institutional database...");
    await seedDatabase();
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
