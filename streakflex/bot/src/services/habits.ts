export interface ActiveStreak {
  id: string;
  name: string;
  currentStreak: number;
}

export async function getActiveStreaks(userId: number): Promise<ActiveStreak[]> {
  const backend = process.env.BACKEND_URL;
  if (!backend) return [];

  try {
    const resp = await fetch(`${backend}/api/habits`, {
      method: "GET",
      headers: {
        "x-telegram-user-id": String(userId),
      },
    });

    const data = await resp.json();

if (!resp.ok) {
  if (resp.status === 402) {
    alert("Лимит 5 привычек достигнут 🚫");
    return [];
  }

  console.error(data);
  return [];
}

return (data.habits ?? []).filter((h: ActiveStreak) => h.currentStreak > 0);
  } catch {
    return [];
  }
}