import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { CreateHabit } from "./pages/CreateHabit";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto max-w-xl bg-slate-50 min-h-screen">
      <header className="border-b bg-white p-4">
        <h1 className="text-xl font-bold">StreakFlex</h1>
        <p className="text-sm text-gray-500">Build habits that stick.</p>
      </header>
      <div className="p-4">
        <CreateHabit onCreated={() => setRefreshKey((x) => x + 1)} />
      </div>
      <div key={refreshKey}>
        <Dashboard />
      </div>
    </main>
  );
}
