import { CheckInStatus, Habit } from "./habit";

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: Habit["category"];
  frequency?: Habit["frequency"];
  reminderTime?: string;
  shareEnabled?: boolean;
}

export interface CheckInRequest {
  status: CheckInStatus;
}

export interface HabitListResponse {
  habits: Habit[];
}
