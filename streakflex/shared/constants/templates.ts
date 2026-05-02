import { HabitCategory } from "../types/habit";

export interface HabitTemplate {
  id: string;
  category: HabitCategory;
  name: string;
  description: string;
}

export const habitTemplates: HabitTemplate[] = [
  {
    id: "fitness_walk",
    category: "fitness",
    name: "10-minute walk",
    description: "Walk outdoors for 10 minutes daily.",
  },
  {
    id: "productivity_deepwork",
    category: "productivity",
    name: "Deep work block",
    description: "Focus for 25 minutes without interruptions.",
  },
  {
    id: "wellness_meditation",
    category: "wellness",
    name: "5-minute meditation",
    description: "Quick mindfulness session to reset.",
  },
  {
    id: "learning_reading",
    category: "learning",
    name: "Read 10 pages",
    description: "Read at least 10 pages from any book.",
  },
];
