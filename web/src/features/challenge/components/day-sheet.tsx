"use client";

import { Sheet } from "@/components/ui/sheet";
import { formatDate } from "../dates";
import type { ChallengeDay } from "../stats";
import { TASK_COUNT } from "../tasks";
import { TaskList } from "./task-list";

type DaySheetProps = {
  /** Stays set while the sheet animates closed. */
  day: ChallengeDay | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * A bottom sheet for reviewing or catching up on a single day.
 */
export function DaySheet({ day, open, onOpenChange }: DaySheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={day ? `Day ${day.number}` : ""}
      description={
        day &&
        `${formatDate(day.date, { weekday: "short", month: "short", day: "numeric" })} · ${day.done.size} of ${TASK_COUNT} done`
      }
    >
      {day && <TaskList day={day} />}
    </Sheet>
  );
}
