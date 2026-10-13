"use client";

import { useState } from "react";
import { FormError } from "@/components/forms/form-error";
import { PageHeader } from "@/components/layout/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { errorMessage, isApiError } from "@/lib/api";
import { addDays, daysBetween, todayIn } from "../dates";
import { useStartChallenge } from "../queries";
import { tasks } from "../tasks";

type StartMode = "today" | "earlier";

const modes = [
  { value: "today", label: "Starting today" },
  { value: "earlier", label: "Already started" },
] as const;

/**
 * Shown until the user starts their first challenge.
 */
export function StartChallenge() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = todayIn(timezone);
  const start = useStartChallenge();

  const [mode, setMode] = useState<StartMode>("today");
  const [startedOn, setStartedOn] = useState(() => addDays(today, -1));
  const [backfill, setBackfill] = useState(true);

  const date = mode === "today" ? today : startedOn;
  const dayNumber = daysBetween(date, today) + 1;
  const error = start.error;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    start.mutate({ started_on: date, timezone, backfill: mode === "earlier" && backfill });
  };

  return (
    <>
      <PageHeader title="75 Hard" subtitle="Seven tasks. Every day. No exceptions." />

      <section className="flex animate-rise flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
        <h2 className="px-1 text-xl font-bold tracking-tight">Every day you’ll</h2>
        <ul className="flex flex-col gap-1 rounded-2xl bg-card p-2">
          {tasks.map(({ key, title, detail, icon: Icon }) => (
            <li key={key} className="flex items-center gap-3.5 rounded-xl px-2 py-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-base font-semibold">{title}</span>
                <span className="text-sm font-normal text-muted-foreground">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="px-1 text-[15px] font-normal text-muted-foreground">Miss anything and you start over at Day 1.</p>
      </section>

      <form
        onSubmit={onSubmit}
        className="flex animate-rise flex-col gap-4"
        style={{ "--i": 2 } as React.CSSProperties}
        noValidate
      >
        <h2 className="px-1 text-xl font-bold tracking-tight">When do you start?</h2>
        <SegmentedControl label="Start date" value={mode} onValueChange={setMode} options={modes} />

        <div
          className="grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-out-soft)"
          style={{ gridTemplateRows: mode === "earlier" ? "1fr" : "0fr", opacity: mode === "earlier" ? 1 : 0 }}
          inert={mode !== "earlier"}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 rounded-2xl bg-card p-2">
              <label className="flex items-center justify-between gap-3 rounded-xl px-2 py-2">
                <span className="text-base font-semibold">Day 1 was</span>
                <input
                  type="date"
                  value={startedOn}
                  min={addDays(today, -74)}
                  max={addDays(today, -1)}
                  onChange={(event) => event.target.value && setStartedOn(event.target.value)}
                  className="h-10 rounded-xl bg-muted px-3 text-base font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-primary/35"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl px-2 py-2">
                <span className="flex flex-col">
                  <span className="text-base font-semibold">I finished every day so far</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Marks days 1–{Math.max(dayNumber - 1, 1)} complete
                  </span>
                </span>
                <Switch checked={backfill} onCheckedChange={setBackfill} />
              </label>
            </div>
          </div>
        </div>

        {error && (
          <FormError
            message={isApiError(error) ? (error.fieldError("started_on") ?? errorMessage(error)) : errorMessage(error)}
          />
        )}

        <SubmitButton size="lg" className="w-full" pending={start.isPending}>
          {dayNumber > 1 ? `Pick up at Day ${dayNumber}` : "Start Day 1"}
        </SubmitButton>
      </form>
    </>
  );
}
