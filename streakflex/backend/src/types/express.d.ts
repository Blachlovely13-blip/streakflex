import "express";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        telegramId: bigint;
        firstName: string;
        languageCode: string;
        isPro: boolean;
      };
    }
  }
}

export {};
