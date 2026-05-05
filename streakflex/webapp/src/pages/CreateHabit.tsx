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

  // 🔥 загрузка реального состояния с сервера
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

      // 🔥 обновляем реальное состояние после создания
      await loadHabits();

      onCreated();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border bg-white p-4"
    >
      <h2 className="text-lg font-bold">Create Habit</h2>

      {/* прогресс */}
      <div className="text-sm text-gray-600">
        Привычки: <b>{habitsCount}/{LIMIT}</b>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isLimitReached}
        placeholder={isLimitReached ? "Лимит достигнут" : "Habit name"}
        className="w-full rounded-md border px-3 py-2"
      />

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

      <button
        type="submit"
        disabled={isSaving || isLimitReached}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLimitReached
          ? "Лимит 5/5 достигнут"
          : isSaving
          ? "Saving..."
          : "Save Habit"}
      </button>
    </form>
  );
}