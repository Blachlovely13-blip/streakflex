import { FormEvent, useEffect, useState } from "react";
import { apiPost, apiGet } from "../services/api";

interface CreateHabitProps {
  onCreated: () => void;
}

export function CreateHabit({ onCreated }: CreateHabitProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("fitness");
  const [isSaving, setIsSaving] = useState(false);

  const LIMIT = 5;
  const [habitsCount, setHabitsCount] = useState(0);

  const isLimitReached = habitsCount >= LIMIT;

  // загрузка реальных привычек
  const loadHabits = async () => {
    try {
      const res = await apiGet<{ habits: any[] }>("/api/habits");
      setHabitsCount(res.habits?.length ?? 0);
    } catch {
      setHabitsCount(0);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isLimitReached) return;

    setIsSaving(true);

    try {
      await apiPost("/api/habits", {
        name,
        category,
        frequency: "daily",
      });

      setName("");
      await loadHabits();
      onCreated();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-3 rounded-lg border bg-white p-4" onSubmit={onSubmit}>
      <h2 className="text-lg font-bold">Create Habit</h2>

      {/* FREE PLAN */}
      <div className="text-sm text-gray-600">
        Free plan: <b>{habitsCount}/{LIMIT}</b>
      </div>

      {/* PRO SCREEN */}
      {isLimitReached && (
        <div className="rounded-lg border bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white">
          <h3 className="text-lg font-bold">Unlock Pro 🚀</h3>

          <p className="mt-1 text-sm text-gray-300">
            Вы достигли лимита Free плана (5 привычек)
          </p>

          <div className="mt-3 space-y-2 text-sm text-gray-200">
            <div>✔ Unlimited habits</div>
            <div>✔ Advanced analytics</div>
            <div>✔ Streak insights</div>
            <div>✔ Priority features</div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-md bg-white px-4 py-2 text-black font-semibold hover:bg-gray-200"
            onClick={() => alert("Здесь будет Pro / Stripe / Telegram Payment")}
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* INPUT */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isLimitReached}
        placeholder={isLimitReached ? "Лимит достигнут" : "Habit name"}
        className="w-full rounded-md border px-3 py-2"
      />

      {/* CATEGORY */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isLimitReached}
        className="w-full rounded-md border px-3 py-2"
      >
        <option value="fitness">Fitness</option>
        <option value="productivity">Productivity</option>
        <option value="wellness">Wellness</option>
        <option value="learning">Learning</option>
        <option value="custom">Custom</option>
      </select>

      {/* BUTTON */}
      <button
        type="submit"
        disabled={isSaving || isLimitReached}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLimitReached
          ? "Перейти на Pro"
          : isSaving
          ? "Saving..."
          : "Save Habit"}
      </button>
    </form>
  );
}