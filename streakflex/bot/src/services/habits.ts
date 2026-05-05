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

    if (!resp.ok) {
      const data = await resp.json();

      if (resp.status === 402) {
        alert("Лимит 5 привычек достигнут 🚫");
        return [];
      }

      console.error(data);
      return [];
    }

    const data = await resp.json();

    return (data.habits ?? []).filter((h: ActiveStreak) => h.currentStreak > 0);

  } catch (e) {
    console.error(e);
    return [];
  }
}