import {
  BookOpenIcon,
  CameraIcon,
  DropletIcon,
  DumbbellIcon,
  SaladIcon,
  SunIcon,
  WineOffIcon,
  type LucideIcon,
} from "lucide-react";
import type { TaskKey } from "@/lib/api";

export type TaskDefinition = {
  key: TaskKey;
  title: string;
  detail: string;
  /** Short name for charts and lists. */
  shortTitle: string;
  icon: LucideIcon;
};

export const tasks: readonly TaskDefinition[] = [
  {
    key: "reading",
    title: "Read 10 pages",
    shortTitle: "Reading",
    detail: "Nonfiction, no audiobooks",
    icon: BookOpenIcon,
  },
  { key: "photo", title: "Progress picture", shortTitle: "Photo", detail: "One photo, every day", icon: CameraIcon },
  { key: "water", title: "Drink a gallon of water", shortTitle: "Water", detail: "128 oz", icon: DropletIcon },
  { key: "workout_one", title: "Workout 1", shortTitle: "Workout 1", detail: "45 minutes", icon: DumbbellIcon },
  { key: "workout_two", title: "Workout 2", shortTitle: "Workout 2", detail: "45 minutes, outdoors", icon: SunIcon },
  { key: "diet", title: "I followed my diet", shortTitle: "Diet", detail: "No cheat meals", icon: SaladIcon },
  {
    key: "no_alcohol",
    title: "I did not drink alcohol",
    shortTitle: "No alcohol",
    detail: "Not a single drink",
    icon: WineOffIcon,
  },
];

export const TASK_COUNT = tasks.length;

export const taskByKey = Object.fromEntries(tasks.map((task) => [task.key, task])) as Record<TaskKey, TaskDefinition>;
