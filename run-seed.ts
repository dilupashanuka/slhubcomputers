import { POST } from "./src/app/api/seed/route";

async function run() {
  console.log("Starting seed process...");
  try {
    const response = await POST();
    const data = await response.json();
    console.log("Seed completed. Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

run();
