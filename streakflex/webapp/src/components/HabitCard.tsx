import { useState } from "react";

export interface Habit {
  id: string;
  name: string;
  currentStreak: number;
  todayStatus?: "completed" | "skipped" | "missed";
  shareEnabled?: boolean;
}

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (habitId: string, status: "completed" | "skipped") => Promise<void>;
}

export function HabitCard({ habit, onCheckIn }: HabitCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckIn = async (status: "completed" | "skipped") => {
    setIsChecking(true);
    try {
      await onCheckIn(habit.id, status);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold text-gray-800">{habit.name}</h3>
        <span className="text-sm font-medium text-orange-500">
          {habit.currentStreak} 🔥
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleCheckIn("completed")}
          disabled={isChecking || habit.todayStatus === "completed"}
          className="flex-1 rounded-md bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        >
          ✓ Done
        </button>
        <button
          onClick={() => handleCheckIn("skipped")}
          disabled={isChecking || habit.todayStatus === "skipped"}
          className="flex-1 rounded-md bg-gray-400 px-4 py-2 text-white disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
