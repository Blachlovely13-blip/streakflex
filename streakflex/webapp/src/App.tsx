import { useEffect, useMemo, useState } from "react";
import { Habit, HabitCard } from "./components/HabitCard";
import { en } from "./i18n/en";
import { ru } from "./i18n/ru";
import { apiGet, apiPost } from "./services/api";

type Lang = "ru" | "en";

interface UserMe {
  firstName: string;
  languageCode: Lang;
  isPro: boolean;
  habitsCount: number;
}

interface UserStatus {
  isPro: boolean;
  habitsCount: number;
  limit: number | null;
}

interface HabitsResponse {
  habits: Habit[];
}

function replaceName(template: string, name: string) {
  return template.replace("{{name}}", name);
}

function CircularProgress({ progress }: { progress: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="112" height="112" className="-rotate-90">
      <circle cx="56" cy="56" r={radius} stroke="#ede9fe" strokeWidth="10" fill="none" />
      <circle
        cx="56"
        cy="56"
        r={radius}
        stroke="#7c3aed"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
      <text
        x="56"
        y="62"
        textAnchor="middle"
        fill="#111827"
        fontSize="18"
        fontWeight={700}
        transform="rotate(90 56 56)"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem("streakflex_onboarding_done"),
  );
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDetails, setShowDetails] = useState<Habit | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const lang: Lang = user?.languageCode === "ru" ? "ru" : "en";
  const t = lang === "ru" ? ru : en;

  async function loadAll() {
    const [me, currentStatus, habitsData] = await Promise.all([
      apiGet<UserMe>("/api/user/me"),
      apiGet<UserStatus>("/api/user/status"),
      apiGet<HabitsResponse>("/api/habits"),
    ]);
    setUser(me);
    setStatus(currentStatus);
    setHabits(habitsData.habits);
  }

  useEffect(() => {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
    void loadAll();
  }, []);

  const doneCount = useMemo(
    () => habits.filter((habit) => habit.todayStatus === "completed").length,
    [habits],
  );
  const maxStreak = useMemo(
    () => Math.max(0, ...habits.map((habit) => habit.currentStreak)),
    [habits],
  );
  const progress = habits.length ? (doneCount / habits.length) * 100 : 0;
  const achievements = [
    { icon: "🥚", label: t.achievementFirstHabit, unlocked: habits.length >= 1 },
    { icon: "🌱", label: t.achievementStreak3, unlocked: maxStreak >= 3 },
    { icon: "🌿", label: t.achievementStreak7, unlocked: maxStreak >= 7 },
    { icon: "🌳", label: t.achievementStreak30, unlocked: maxStreak >= 30 },
    { icon: "🔥", label: t.achievementAllDone, unlocked: habits.length > 0 && doneCount === habits.length },
  ];

  const addHabit = async () => {
    if (!newHabit.trim()) return;
    try {
      await apiPost("/api/habits", { name: newHabit.trim() });
      setNewHabit("");
      await loadAll();
    } catch (error) {
      if (String(error).includes("402")) setShowPaywall(true);
    }
  };

  const checkIn = async (habitId: string, checkInStatus: "completed" | "skipped") => {
    await apiPost(`/api/habits/${habitId}/check-in`, { status: checkInStatus });
    await loadAll();
  };

  const askAi = async () => {
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const payload = await apiPost<{ advice: string }>("/api/ai/advice", {
        question: showDetails?.name
          ? `Дай совет по привычке: ${showDetails.name}`
          : "Дай общий совет на сегодня",
      });
      setAiAnswer(payload.advice);
    } finally {
      setAiLoading(false);
    }
  };

  const setLanguage = async (languageCode: Lang) => {
    await apiPost("/api/user/language", { languageCode });
    await loadAll();
  };

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  if (showOnboarding) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-violet-400 via-fuchsia-300 to-orange-200 p-6 text-white">
        <div className="mx-auto mt-10 max-w-md rounded-3xl bg-white/20 p-6 backdrop-blur">
          <h1 className="text-3xl font-bold">{t.onboardingTitle}</h1>
          <p className="mt-2 text-white/95">{t.onboardingSubtitle}</p>
          <div className="mt-6 space-y-3 text-sm">
            <p>🗓️ {t.planDay}</p>
            <p>🌿 {t.buildHabits}</p>
            <p>🏆 {t.goals}</p>
          </div>
          <button
            className="mt-8 w-full rounded-2xl bg-violet-600 px-4 py-3 font-semibold"
            onClick={() => {
              localStorage.setItem("streakflex_onboarding_done", "1");
              setShowOnboarding(false);
            }}
          >
            {t.onboardingStart}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-300 via-pink-200 to-orange-100 p-4">
      <div className="mx-auto max-w-[480px] space-y-4">
        <header className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">StreakFlex</h1>
            <div className="flex items-center gap-2">
              {status?.isPro ? (
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white animate-pulse">
                  {t.pro}
                </span>
              ) : (
                <button
                  className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={() => window.open("https://t.me/tribute/app?startapp=pvmZ", "_blank")}
                >
                  {t.upgrade}
                </button>
              )}
              <button
                className="rounded-full border px-3 py-1 text-xs"
                onClick={() => void setLanguage(lang === "ru" ? "en" : "ru")}
              >
                {t.language}: {lang.toUpperCase()}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {replaceName(habits.length ? t.welcomeBack : t.welcomeNew, user.firstName)}
          </p>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow-md">
          <p className="text-sm text-slate-500">{t.todayProgress}</p>
          <div className="mt-2 flex items-center justify-center">
            <CircularProgress progress={progress} />
          </div>
          {progress === 100 && habits.length > 0 && (
            <p className="mt-2 text-center text-xl">🎉 🎊 🎉</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex gap-2">
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="flex-1 rounded-xl border px-3 py-2"
              placeholder={t.habitPlaceholder}
            />
            <button className="rounded-xl bg-violet-600 px-4 py-2 text-white" onClick={addHabit}>
              {t.addHabit}
            </button>
          </div>
          {!status?.isPro && (
            <p className="mt-2 text-xs text-slate-500">
              {status?.habitsCount ?? 0}/{status?.limit ?? 5}
            </p>
          )}
        </section>

        <section className="space-y-3">
          {habits.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-md">{t.noHabits}</div>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onCheckIn={checkIn}
                onOpenDetails={setShowDetails}
                doneLabel={t.done}
                skipLabel={t.skip}
              />
            ))
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-md">
          <h3 className="text-sm font-bold text-slate-800">{t.achievements}</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.label}
                className={`rounded-xl border p-2 text-center text-xs ${achievement.unlocked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 opacity-60"}`}
              >
                <p className="text-lg">{achievement.icon}</p>
                <p>{achievement.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 flex items-end bg-black/40 p-4">
          <div className="w-full rounded-2xl bg-white p-4">
            <h3 className="text-lg font-bold">{t.freeLimitTitle}</h3>
            <p className="mt-1 text-sm text-slate-600">{t.freeLimitText}</p>
            <button
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2 text-white"
              onClick={() => window.open("https://t.me/tribute/app?startapp=pvmZ", "_blank")}
            >
              {t.openTribute}
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 flex items-end bg-black/40 p-4">
          <div className="w-full rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{showDetails.name}</h3>
              <button onClick={() => setShowDetails(null)}>✕</button>
            </div>
            <p className="mt-2 text-sm text-slate-500">🔥 {showDetails.currentStreak} day streak</p>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 rounded ${i < Math.min(showDetails.currentStreak, 28) ? "bg-emerald-400" : "bg-slate-200"}`}
                />
              ))}
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2 text-white"
              onClick={askAi}
            >
              {t.askAi}
            </button>
            {aiLoading && <p className="mt-2 text-sm text-slate-500">{t.aiThinking}</p>}
            {aiAnswer && <p className="mt-2 rounded-xl bg-slate-100 p-3 text-sm">{aiAnswer}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
