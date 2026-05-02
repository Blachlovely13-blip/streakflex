import { Bot, InlineKeyboard } from "grammy";
import { getActiveStreaks } from "./services/habits.js";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("BOT_TOKEN is required");
}

const webAppUrl = process.env.WEBAPP_URL || "https://example.com";
export const bot = new Bot(botToken);

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🏃 Fitness Habits", "template_fitness")
    .text("💼 Productivity", "template_productivity")
    .row()
    .text("🧘 Wellness", "template_wellness")
    .text("📚 Learning", "template_learning")
    .row()
    .webApp("Open StreakFlex", webAppUrl);

  await ctx.reply(
    "Welcome to StreakFlex! Build habits that stick with social accountability.\n\nChoose a category or open the full app:",
    { reply_markup: keyboard },
  );
});

bot.callbackQuery(/^template_/, async (ctx) => {
  const category = ctx.callbackQuery.data.replace("template_", "");
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `Great choice: ${category}. Open the mini app to create your first habit with reminders.`,
    {
      reply_markup: new InlineKeyboard().webApp("Create Habit", webAppUrl),
    },
  );
});

bot.on("inline_query", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const streaks = await getActiveStreaks(userId);
  const results = streaks.map((streak) => ({
    type: "article" as const,
    id: `streak_${streak.id}`,
    title: `🔥 ${streak.name} - ${streak.currentStreak} day streak!`,
    description: `Just hit ${streak.currentStreak} days of ${streak.name}`,
    input_message_content: {
      message_text: `🔥 I'm on a ${streak.currentStreak}-day streak with ${streak.name}! Join me: @streakflex_bot`,
    },
  }));

  await ctx.answerInlineQuery(results, { cache_time: 15 });
});
