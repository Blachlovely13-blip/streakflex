import { Router } from "express";
import { prisma } from "../services/prisma.js";

const router = Router();
const FREE_HABITS_LIMIT = 5;

router.get("/me", async (req, res) => {
  if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const habitsCount = await prisma.habit.count({ where: { userId: user.id } });
  const isNew = habitsCount === 0;
  const isRu = user.languageCode === "ru";

  return res.json({
    firstName: user.firstName,
    languageCode: user.languageCode,
    isPro: user.isPro,
    habitsCount,
    limit: user.isPro ? null : FREE_HABITS_LIMIT,
    greeting: isNew
      ? isRu
        ? `Добро пожаловать, ${user.firstName}!`
        : `Welcome, ${user.firstName}!`
      : isRu
        ? `С возвращением, ${user.firstName}!`
        : `Welcome back, ${user.firstName}!`,
  });
});

router.post("/language", async (req, res) => {
  if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });
  const { languageCode } = req.body as { languageCode?: string };
  if (!languageCode || !["ru", "en"].includes(languageCode)) {
    return res.status(400).json({ error: "languageCode must be ru or en" });
  }

  await prisma.user.update({
    where: { id: req.authUser.id },
    data: { languageCode },
  });
  return res.json({ ok: true });
});

router.get("/status", async (req, res) => {
  if (!req.authUser) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const habitsCount = await prisma.habit.count({ where: { userId: user.id } });
  return res.json({
    isPro: user.isPro,
    habitsCount,
    limit: user.isPro ? null : FREE_HABITS_LIMIT,
  });
});

export default router;
