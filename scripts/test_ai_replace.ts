import { discoverReplacementHotelDraft } from "../src/lib/ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

async function run() {
  try {
    console.log("Starting test...");
    const draft = await discoverReplacementHotelDraft("Hôtel Madame Rêve", "Paris", "City energy");
    console.log("Draft:", draft);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
