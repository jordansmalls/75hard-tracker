"use client";

import { ChevronRightIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { errorMessage, type TaskKey } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCheckIn } from "../queries";
import { OUNCES_PER_GALLON, type ChallengeDay } from "../stats";
import { tasks, type TaskDefinition } from "../tasks";
import { CheckMark } from "./check-mark";
import { PhotoSheet } from "./photo-sheet";
import { ReadingSheet } from "./reading-sheet";
import { WaterSheet } from "./water-sheet";

type DetailTask = Extract<TaskKey, "water" | "reading" | "photo">;

const detailTasks = new Set<TaskKey>(["water", "reading", "photo"]);

type TaskListProps = {
  day: ChallengeDay;
  /**
   * Let water, reading and photo open a sheet for logging details. The check circle
   * still toggles the task directly. Off inside other sheets.
   */
  details?: boolean;
  /** The book to suggest in the reading sheet. */
  suggestedTitle?: string | null;
  /** Stagger the rows in when the list first appears. */
  animate?: boolean;
};

const tileClass =
  "flex w-full items-center gap-3.5 rounded-2xl bg-card px-4 py-3.5 text-left in-[.dark_[data-sheet]]:bg-muted";
const pressClass =
  "outline-none transition-transform duration-200 ease-(--ease-out-soft) focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-[0.98]";

export function TaskList({ day, details = false, suggestedTitle = null, animate = false }: TaskListProps) {
  const checkIn = useCheckIn();
  const [sheet, setSheet] = useState<DetailTask | null>(null);
  const [lastSheet, setLastSheet] = useState<DetailTask>("water");

  const toggle = (task: TaskKey) => {
    const next = !day.done.has(task);
    if (next) navigator.vibrate?.(8);
    checkIn.mutate(
      { date: day.date, task, done: next },
      { onError: (error) => toast.error(errorMessage(error, "That didn’t save. Try again.")) },
    );
  };

  const openSheet = (task: DetailTask) => {
    setLastSheet(task);
    setSheet(task);
  };
  const sheetProps = (task: DetailTask) => ({
    day,
    open: sheet === task,
    onOpenChange: (open: boolean) => setSheet(open ? task : null),
  });

  return (
    <>
      <ul className="flex flex-col gap-2">
        {tasks.map((task, index) => {
          const checked = day.done.has(task.key);
          const hasSheet = details && detailTasks.has(task.key);

          return (
            <li
              key={task.key}
              className={cn(animate && "animate-rise")}
              style={{ "--i": index + 2 } as React.CSSProperties}
            >
              {hasSheet ? (
                <div className={cn(tileClass, "py-0 pr-1.5")}>
                  <button
                    type="button"
                    onClick={() => openSheet(task.key as DetailTask)}
                    className={cn("flex min-w-0 flex-1 items-center gap-3.5 py-3.5 text-left", pressClass)}
                  >
                    <TaskIcon task={task} checked={checked} day={day} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-1 text-[17px] leading-snug font-semibold">
                        {task.title}
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                      </span>
                      <TaskDetail task={task} day={day} />
                    </span>
                  </button>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={task.title}
                    onClick={() => toggle(task.key)}
                    className={cn("grid size-12 shrink-0 place-items-center rounded-full", pressClass)}
                  >
                    <CheckMark checked={checked} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(task.key)}
                  className={cn(tileClass, pressClass)}
                >
                  <TaskIcon task={task} checked={checked} day={day} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[17px] leading-snug font-semibold">{task.title}</span>
                    <span className="text-sm font-normal text-muted-foreground">{task.detail}</span>
                  </span>
                  <CheckMark checked={checked} />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {details && (
        <>
          {/* Keep the last-opened sheet mounted so it can animate closed. */}
          {lastSheet === "water" && <WaterSheet {...sheetProps("water")} />}
          {lastSheet === "reading" && <ReadingSheet {...sheetProps("reading")} suggestedTitle={suggestedTitle} />}
          {lastSheet === "photo" && <PhotoSheet {...sheetProps("photo")} />}
        </>
      )}
    </>
  );
}

function TaskIcon({ task, checked, day }: { task: TaskDefinition; checked: boolean; day: ChallengeDay }) {
  if (task.key === "photo" && day.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- private, session-authenticated image
      <img src={day.photo.thumbnail_url} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
    );
  }

  const Icon = task.icon;
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-300",
        checked ? "bg-primary-soft text-primary" : "bg-muted text-foreground in-[.dark_[data-sheet]]:bg-background/60",
      )}
    >
      <Icon className="size-[22px]" strokeWidth={2} />
    </span>
  );
}

/** The live detail line under water, reading and photo. */
function TaskDetail({ task, day }: { task: TaskDefinition; day: ChallengeDay }): ReactNode {
  const muted = "text-sm font-normal text-muted-foreground";

  switch (task.key) {
    case "water": {
      const ounces = day.log?.water_oz ?? 0;
      if (ounces === 0) return <span className={muted}>Tap to log as you go</span>;
      return (
        <span className="flex flex-col gap-1.5 pt-0.5">
          <span className="text-sm font-semibold tabular-nums">
            {ounces} <span className="font-normal text-muted-foreground">of {OUNCES_PER_GALLON} oz</span>
          </span>
          <span className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-track">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-(--ease-out-soft)"
              style={{ width: `${Math.min(ounces / OUNCES_PER_GALLON, 1) * 100}%` }}
            />
          </span>
        </span>
      );
    }
    case "reading": {
      const log = day.log;
      if (!log?.pages && !log?.book_title) return <span className={muted}>{task.detail}</span>;
      return (
        <span className="truncate text-sm font-semibold">
          {log.book_title ?? "Reading"}
          {log.pages && <span className="font-normal text-muted-foreground"> · {log.pages} pages</span>}
        </span>
      );
    }
    case "photo":
      return <span className={muted}>{day.photo ? "Saved. Tap to view" : "Tap to take or upload"}</span>;
    default:
      return <span className={muted}>{task.detail}</span>;
  }
}
