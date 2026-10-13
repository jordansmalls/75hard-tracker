"use client";

import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "../dates";
import type { ChallengeDay } from "../stats";
import { TASK_COUNT } from "../tasks";

type StreakGridProps = {
  days: ChallengeDay[];
  onSelect: (day: ChallengeDay) => void;
};

const statusLabel = {
  complete: "complete",
  today: "today",
  missed: "missed",
  upcoming: "upcoming",
} as const;

/**
 * All 75 days as circles: empty until the day is done, then filled with a check.
 */
export function StreakGrid({ days, onSelect }: StreakGridProps) {
  return (
    <ol className="grid grid-cols-10 gap-x-2 gap-y-2.5">
      {days.map((day) => {
        const label = `Day ${day.number}, ${formatDate(day.date, { weekday: "long", month: "long", day: "numeric" })}, ${statusLabel[day.status]}${
          day.status === "today" || day.status === "missed" ? `, ${day.done.size} of ${TASK_COUNT} tasks` : ""
        }`;
        const content = <DayDot day={day} />;

        return (
          <li key={day.number} className="aspect-square">
            {day.status === "upcoming" ? (
              <span role="img" aria-label={label} className="block size-full">
                {content}
              </span>
            ) : (
              <button
                type="button"
                aria-label={label}
                onClick={() => onSelect(day)}
                className="block size-full rounded-full transition-transform duration-200 outline-none focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-90"
              >
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DayDot({ day }: { day: ChallengeDay }) {
  switch (day.status) {
    case "complete":
      return (
        <span className="grid size-full animate-pop place-items-center rounded-full bg-primary">
          <svg viewBox="0 0 24 24" className="size-[58%] text-primary-foreground" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "today":
      return (
        <span className="grid size-full animate-soft-pulse place-items-center rounded-full text-[11px] font-extrabold text-primary shadow-[inset_0_0_0_2.5px_var(--primary)]">
          {day.number}
        </span>
      );
    case "missed":
      return (
        <span className="grid size-full place-items-center rounded-full bg-destructive-soft text-destructive">
          <XIcon className="size-[52%]" strokeWidth={3} aria-hidden />
        </span>
      );
    case "upcoming":
      return <span className={cn("block size-full rounded-full shadow-[inset_0_0_0_2px_var(--track)]")} />;
  }
}
