import { CheckIn } from "@prisma/client";

export function calculateStreaks(checkIns: CheckIn[]) {
  const completed = checkIns
    .filter((c) => c.status === "completed")
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const item of completed) {
    if (!prevDate) {
      running = 1;
      currentStreak = 1;
      longestStreak = 1;
      prevDate = item.date;
      continue;
    }

    const dayDiff = Math.round(
      (prevDate.getTime() - item.date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff === 1) {
      running += 1;
      if (currentStreak === running - 1) currentStreak = running;
    } else if (dayDiff > 1) {
      running = 1;
    }

    longestStreak = Math.max(longestStreak, running);
    prevDate = item.date;
  }

  return { currentStreak, longestStreak };
}
