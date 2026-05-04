import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { calculateStreaks } from "../services/streaks.js";

const router = Router();
const FREE_HABITS_LIMIT = 5;

router.use((req, res, next) => {
  req.authUser = { id: "1", isPro: false };
  next();
});

router.get("/", async (req, res) => {
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const dbUser = await prisma.user.findUnique({
    where: { id: String(user.id) },
    include: { habits: true },
  });

  if (!dbUser) return res.json({ habits: [] });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await Promise.all(
    dbUser.habits.map(async (habit) => {
      const checkIns = await prisma.checkIn.findMany({
        where: { habitId: habit.id },
        orderBy: { date: "desc" },
      });

      const streaks = calculateStreaks(checkIns);

      const todayCheckIn = checkIns.find(
        (c) => c.date.getTime() === today.getTime()
      );

      return {
        ...habit,
        ...streaks,
        todayStatus: todayCheckIn?.status,
      };
    })
  );

  return res.json({ habits });
});

router.post("/", async (req, res) => {
  const user = req.authUser;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "name required" });
  }

  const habitsCount = await prisma.habit.count({
    where: { userId: String(user.id) },
  });

  if (!user.isPro && habitsCount >= FREE_HABITS_LIMIT) {
    return res.status(402).json({
      error: "Free plan limit reached",
      limit: FREE_HABITS_LIMIT,
      needsPro: true,
    });
  }

  const habit = await prisma.habit.create({
    data: {
      name: name.trim(),
      category: "custom",
      userId: String(user.id),
    },
  });

  return res.status(201).json(habit);
});

router.post("/:habitId/check-in", async (req, res) => {
  const user = req.authUser;
  const { habitId } = req.params;
  const { status } = req.body;

  if (!user || !status) {
    return res.status(400).json({ error: "missing inputs" });
  }

  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: String(user.id),
    },
  });

  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const checkIn = await prisma.checkIn.upsert({
    where: {
      habitId_date: { habitId, date: now },
    },
    update: { status },
    create: {
      habitId,
      userId: String(user.id),
      status,
      date: now,
    },
  });

  return res.json(checkIn);
});

export default router;