import "dotenv/config";
import { bot } from "./bot.js";

async function main() {
  await bot.start();
  console.log("Bot started");
}

main().catch((error) => {
  console.error("Bot failed to start:", error);
  process.exit(1);
});
