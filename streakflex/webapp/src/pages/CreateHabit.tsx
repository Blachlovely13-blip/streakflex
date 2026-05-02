import { FormEvent, useState } from "react";
import { apiPost } from "../services/api";

interface CreateHabitProps {
  onCreated: () => void;
}

export function CreateHabit({ onCreated }: CreateHabitProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("fitness");
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiPost("/api/habits", { name, category, frequency: "daily" });
      setName("");
      onCreated();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-bold">Create Habit</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Habit name"
        className="w-full rounded-md border px-3 py-2"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
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
        disabled={isSaving}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Habit"}
      </button>
    </form>
  );
}
