const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function telegramUserId(): string {
  const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  return id ? String(id) : "123456789";
}

export async function apiGet<T>(path: string): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "x-telegram-user-id": telegramUserId() },
  });
  if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
  return resp.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-user-id": telegramUserId(),
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
  return resp.json() as Promise<T>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id?: number } };
        HapticFeedback?: { notificationOccurred: (kind: string) => void };
      };
    };
  }
}
