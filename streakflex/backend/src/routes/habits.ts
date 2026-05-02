import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { calculateStreaks } from "../services/streaks.js";

const router = Router();

router.get("/", async (req, res) => {
  const userId = String(req.headers["x-telegram-user-id"] || "");
  if (!userId) return res.status(400).json({ error: "Missing telegram user id" });

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(userId) },
    include: { habits: true },
  });
  if (!user) return res.json({ habits: [] });

  const habits = await Promise.all(
    user.habits.map(async (habit) => {
      const checkIns = await prisma.checkIn.findMany({
        where: { habitId: habit.id },
        orderBy: { date: "desc" },
      });
      const streaks = calculateStreaks(checkIns);
      return { ...habit, ...streaks };
    }),
  );

  return res.json({ habits });
});

router.post("/", async (req, res) => {
  const userId = String(req.headers["x-telegram-user-id"] || "");
  if (!userId) return res.status(400).json({ error: "Missing telegram user id" });

  const { name, description, category, frequency, reminderTime, shareEnabled } = req.body;
  if (!name || !category) return res.status(400).json({ error: "name/category required" });

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(userId) },
    update: {},
    create: {
      telegramId: BigInt(userId),
      firstName: "Telegram User",
    },
  });

  const habit = await prisma.habit.create({
    data: {
      name,
      description,
      category,
      frequency: frequency ?? "daily",
      reminderTime,
      shareEnabled: shareEnabled ?? true,
      userId: user.id,
    },
  });

  return res.status(201).json(habit);
});

router.post("/:habitId/check-in", async (req, res) => {
  const userId = String(req.headers["x-telegram-user-id"] || "");
  const { habitId } = req.params;
  const { status } = req.body as { status?: string };
  if (!userId || !status) return res.status(400).json({ error: "missing inputs" });

  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(userId) } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const checkIn = await prisma.checkIn.upsert({
    where: { habitId_date: { habitId, date: now } },
    update: { status },
    create: { habitId, userId: user.id, status, date: now },
  });

  return res.json(checkIn);
});

export default router;
