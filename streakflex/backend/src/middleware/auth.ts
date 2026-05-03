import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../services/prisma.js";

function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) result[key] = value;
  return result;
}

function isValidInitData(initData: string, botToken: string): boolean {
  const parsed = parseInitData(initData);
  const hash = parsed.hash;
  if (!hash) return false;

  const dataCheckString = Object.entries(parsed)
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  return expectedHash === hash;
}

function getUserFromInitData(initData: string): {
  telegramId: bigint;
  firstName: string;
  languageCode: string;
} | null {
  const parsed = parseInitData(initData);
  if (!parsed.user) return null;

  try {
    const user = JSON.parse(parsed.user) as {
      id: number;
      first_name?: string;
      language_code?: string;
    };
    return {
      telegramId: Number(user.id),
      firstName: user.first_name || "Friend",
      languageCode: user.language_code || "en",
    };
  } catch {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const initData = req.headers["x-telegram-init-data"];
  const initDataValue = Array.isArray(initData) ? initData[0] : initData;
  const botToken = process.env.BOT_TOKEN;

  // Local development fallback when Telegram webview is unavailable.
  if (!initDataValue) {
    if (process.env.NODE_ENV !== "production") {
      const devUserId = req.headers["x-telegram-user-id"];
      const devUserIdValue = Array.isArray(devUserId) ? devUserId[0] : devUserId;
      if (!devUserIdValue) {
        return res.status(401).json({ error: "Missing Telegram initData" });
      }
      const telegramId = Number(devUserIdValue);
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: {},
        create: { telegramId, firstName: "Local User", languageCode: "en" },
      });
      req.authUser = {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        languageCode: user.languageCode,
        isPro: user.isPro,
      };
      return next();
    }
    return res.status(401).json({ error: "Missing Telegram initData" });
  }

  if (!botToken || !isValidInitData(initDataValue, botToken)) {
    return res.status(401).json({ error: "Invalid Telegram signature" });
  }

  const initUser = getUserFromInitData(initDataValue);
  if (!initUser) return res.status(401).json({ error: "Invalid Telegram user payload" });

  const user = await prisma.user.upsert({
    where: { telegramId: initUser.telegramId },
    update: {
      firstName: initUser.firstName,
      languageCode: initUser.languageCode,
    },
    create: {
      telegramId: initUser.telegramId,
      firstName: initUser.firstName,
      languageCode: initUser.languageCode,
    },
  });

  req.authUser = {
    id: user.id,
    telegramId: user.telegramId,
    firstName: user.firstName,
    languageCode: user.languageCode,
    isPro: user.isPro,
  };

  return next();
}
