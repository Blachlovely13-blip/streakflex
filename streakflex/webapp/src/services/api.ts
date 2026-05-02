const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function telegramInitData(): string {
  return window.Telegram?.WebApp?.initData || "";
}

function fallbackTelegramUserId(): string {
  const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  return id ? String(id) : "123456789";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  headers.set("x-telegram-init-data", telegramInitData());
  headers.set("x-telegram-user-id", fallbackTelegramUserId());

  const resp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Request failed: ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: { user?: { id?: number } };
        HapticFeedback?: { notificationOccurred: (kind: string) => void };
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}
