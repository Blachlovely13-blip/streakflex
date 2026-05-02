export type HabitCategory =
  | "fitness"
  | "productivity"
  | "wellness"
  | "learning"
  | "custom";

export type HabitFrequency = "daily" | "weekly" | "custom";
export type CheckInStatus = "completed" | "skipped" | "missed";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  reminderTime?: string;
  shareEnabled: boolean;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  todayStatus?: CheckInStatus;
}
