import { Router } from "express";
import { prisma } from "../services/prisma.js";

const router = Router();

function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

router.post("/advice", async (req, res) => {
  if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: req.authUser.id },
    include: { habits: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.isPro && user.aiLastUsedAt && isSameDay(user.aiLastUsedAt, new Date())) {
    return res.status(402).json({
      error: "Daily AI limit reached",
      needsPro: true,
      remaining: 0,
    });
  }

  const { question } = req.body as { question?: string };
  const language = user.languageCode === "ru" ? "ru" : "en";
  const habitsSummary = user.habits
    .map((habit) => `- ${habit.name} (current streak: ${habit.currentStreak})`)
    .join("\n");

  const prompt = `Ты — персональный тренер по привычкам и продуктивности. Твоё имя — Флекс. Ты работаешь в премиум-приложении StreakFlex.
Твой стиль общения:
- Дружелюбный, но не панибратский.
- Лёгкий юмор без перегиба.
- Честно и поддерживающе.
- Ответы короткие (2-4 предложения), ёмкие, без воды.

Важно: Всегда отвечай на языке пользователя: ${language}.

Пользователь: ${user.firstName}
Привычки:
${habitsSummary || "- Пока нет привычек"}
Вопрос пользователя: ${question || "Дай персональную рекомендацию на сегодня."}`;

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "MISTRAL_API_KEY is not configured" });

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    return res.status(502).json({ error: "AI provider request failed" });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const advice = payload.choices?.[0]?.message?.content?.trim();
  if (!advice) return res.status(502).json({ error: "AI returned empty response" });

  await prisma.user.update({
    where: { id: user.id },
    data: { aiLastUsedAt: new Date() },
  });

  return res.json({ advice, isPro: user.isPro });
});

export default router;
