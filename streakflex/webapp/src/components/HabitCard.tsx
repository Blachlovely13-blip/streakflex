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
  onOpenDetails: (habit: Habit) => void;
  doneLabel: string;
  skipLabel: string;
}

export function HabitCard({
  habit,
  onCheckIn,
  onOpenDetails,
  doneLabel,
  skipLabel,
}: HabitCardProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const handleCheckIn = async (status: "completed" | "skipped") => {
    setIsChecking(true);
    try {
      await onCheckIn(habit.id, status);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    } finally {
      setIsChecking(false);
    }
  };

  const startPress = () => {
    const timer = window.setTimeout(() => onOpenDetails(habit), 500);
    setPressTimer(timer);
  };

  const endPress = () => {
    if (pressTimer) window.clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div
      className="rounded-2xl border border-white/70 bg-white p-4 shadow-md"
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
    >
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
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-white disabled:opacity-50"
        >
          ✓ {doneLabel}
        </button>
        <button
          onClick={() => handleCheckIn("skipped")}
          disabled={isChecking || habit.todayStatus === "skipped"}
          className="flex-1 rounded-xl bg-slate-400 px-4 py-2 text-white disabled:opacity-50"
        >
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
