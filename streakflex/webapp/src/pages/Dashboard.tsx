import { useEffect, useState } from "react";
import { HabitCard, Habit } from "../components/HabitCard";
import { apiGet, apiPost } from "../services/api";

interface HabitListResponse {
  habits: Habit[];
}

export function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHabits() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<HabitListResponse>("/api/habits");
      setHabits(data.habits);
    } catch {
      setError("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHabits();
  }, []);

  const onCheckIn = async (habitId: string, status: "completed" | "skipped") => {
    await apiPost(`/api/habits/${habitId}/check-in`, { status });
    await loadHabits();
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading habits...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-3 p-4">
      <h2 className="text-lg font-bold">Today&apos;s habits</h2>
      {habits.length === 0 ? (
        <div className="rounded-md border bg-white p-4 text-sm text-gray-600">
          No habits yet. Create your first one.
        </div>
      ) : (
        habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onCheckIn={onCheckIn} />
        ))
      )}
    </div>
  );
}
