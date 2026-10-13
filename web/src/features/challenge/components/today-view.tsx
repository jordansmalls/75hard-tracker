"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { PageHeader } from "@/components/layout/page-header";
import type { Challenge } from "@/lib/api";
import { routes } from "@/lib/routes";
import { formatDate } from "../dates";
import { useChallenge, useToday } from "../queries";
import { getProgress, latestBookTitle, type ChallengeDay, type Progress } from "../stats";
import { TASK_COUNT } from "../tasks";
import { DaySheet } from "./day-sheet";
import { ProgressRing } from "./progress-ring";
import { RestartDialog } from "./restart-dialog";
import { StartChallenge } from "./start-challenge";
import { StreakGrid } from "./streak-grid";
import { TaskList } from "./task-list";

export function TodayView() {
  const { data: challenge, isPending, isError, refetch } = useChallenge();

  if (isPending) return <FullPageSpinner />;
  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="font-semibold">Couldn’t load your challenge.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (!challenge) return <StartChallenge />;

  return <ChallengeToday challenge={challenge} />;
}

function stagger(index: number) {
  return { "--i": index } as React.CSSProperties;
}

function ChallengeToday({ challenge }: { challenge: Challenge }) {
  const today = useToday(challenge.timezone);
  const progress = getProgress(challenge, today);
  const [sheetDay, setSheetDay] = useState<number>();
  const [sheetOpen, setSheetOpen] = useState(false);

  const openDay = (day: ChallengeDay) => {
    setSheetDay(day.number);
    setSheetOpen(true);
  };

  const dayNumber = progress.today?.number;
  const title = progress.isFinished ? "75 done" : dayNumber ? `Day ${dayNumber}` : "Day 75 is behind you";

  return (
    <>
      <PageHeader title={title} subtitle={formatDate(today, { weekday: "long", month: "long", day: "numeric" })} />

      {progress.isFinished ? (
        <FinishedCard />
      ) : (
        <>
          {progress.firstMissed && <MissedDayNotice day={progress.firstMissed} onReview={openDay} />}
          <TodayHero progress={progress} />
        </>
      )}

      {progress.today && !progress.isFinished && (
        <section className="flex flex-col gap-3">
          <div className="flex animate-rise items-baseline justify-between px-1" style={stagger(2)}>
            <h2 className="text-xl font-bold tracking-tight">Today’s tasks</h2>
            <span className="text-[15px] font-semibold text-muted-foreground tabular-nums">
              {progress.today.done.size} of {TASK_COUNT}
            </span>
          </div>
          <TaskList day={progress.today} details suggestedTitle={latestBookTitle(challenge)} animate />
        </section>
      )}

      <QuickStats progress={progress} />

      <section className="flex animate-rise flex-col gap-3" style={stagger(10)}>
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-xl font-bold tracking-tight">Your 75</h2>
          <span className="text-[15px] font-semibold text-muted-foreground tabular-nums">
            {progress.completedDays} done · {progress.daysLeft} left
          </span>
        </div>
        <div className="rounded-2xl bg-card p-4">
          <StreakGrid days={progress.days} onSelect={openDay} />
        </div>
        <p className="px-1 text-sm font-normal text-muted-foreground">Tap a day to see or update it.</p>
      </section>

      <DaySheet day={sheetDay ? progress.days[sheetDay - 1] : undefined} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

function TodayHero({ progress }: { progress: Progress }) {
  const done = progress.today?.done.size ?? 0;
  const complete = done === TASK_COUNT;

  return (
    <section className="flex animate-rise items-center gap-5 rounded-3xl bg-card p-5" style={stagger(1)}>
      <ProgressRing value={done / TASK_COUNT} label={`${done} of ${TASK_COUNT} tasks done today`}>
        <span className="flex flex-col items-center leading-none">
          <span className="text-[28px] font-extrabold tabular-nums">
            {done}
            <span className="text-lg font-semibold text-muted-foreground">/{TASK_COUNT}</span>
          </span>
          <span className="mt-1 text-xs font-semibold text-muted-foreground">today</span>
        </span>
      </ProgressRing>
      <div className="flex min-w-0 flex-col">
        <span className="text-5xl leading-none font-extrabold tracking-tight tabular-nums">{progress.daysLeft}</span>
        <span className="mt-1 text-lg font-bold">{progress.daysLeft === 1 ? "day left" : "days left"}</span>
        <span key={String(complete)} className="mt-1 animate-rise text-[15px] font-medium text-muted-foreground">
          {complete
            ? "Today’s done. Nice work."
            : `${TASK_COUNT - done} ${TASK_COUNT - done === 1 ? "task" : "tasks"} to go today`}
        </span>
      </div>
    </section>
  );
}

function QuickStats({ progress }: { progress: Progress }) {
  const stats = [
    { value: progress.pagesRead.toLocaleString(), label: "pages read" },
    { value: progress.gallons.toLocaleString(), label: progress.gallons === 1 ? "gallon" : "gallons" },
    { value: progress.currentStreak.toLocaleString(), label: "day streak" },
  ];

  return (
    <section className="flex animate-rise flex-col gap-3" style={stagger(9)}>
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">So far</h2>
        <Link href={routes.insights} className="text-[15px] font-semibold text-primary">
          All insights
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={routes.insights}
            className="flex flex-col gap-0.5 rounded-2xl bg-card p-3.5 transition-transform duration-200 active:scale-[0.97]"
          >
            <span className="text-2xl font-extrabold tracking-tight tabular-nums">{stat.value}</span>
            <span className="text-[13px] font-semibold text-muted-foreground">{stat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MissedDayNotice({ day, onReview }: { day: ChallengeDay; onReview: (day: ChallengeDay) => void }) {
  return (
    <section className="flex animate-rise flex-col gap-4 rounded-3xl bg-destructive-soft p-5" style={stagger(1)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-destructive">Day {day.number} wasn’t finished</h2>
        <p className="text-[15px] font-normal">
          Only {day.done.size} of {TASK_COUNT} tasks were checked off on{" "}
          {formatDate(day.date, { weekday: "short", month: "short", day: "numeric" })}. Forgot to log them? Fill them
          in. Otherwise, 75 Hard means starting over.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="bg-card" onClick={() => onReview(day)}>
          Log Day {day.number}
        </Button>
        <RestartDialog trigger={<Button className="bg-destructive hover:bg-destructive/90">Start over</Button>} />
      </div>
    </section>
  );
}

function FinishedCard() {
  return (
    <section
      className="flex animate-rise flex-col items-center gap-4 rounded-3xl bg-primary p-6 text-center text-primary-foreground"
      style={stagger(1)}
    >
      <span className="text-6xl leading-none font-extrabold tracking-tight">75/75</span>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">You finished 75 Hard.</h2>
        <p className="text-[15px] font-medium opacity-90">Every task, every day. Take a look at what you did.</p>
      </div>
      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          nativeButton={false}
          render={<Link href={routes.insights} />}
          className="bg-white text-primary hover:bg-white/90"
        >
          See insights
        </Button>
        <RestartDialog
          title="Start another round?"
          description="A new 75 days starts today."
          confirmLabel="Start Day 1"
          trigger={<Button className="bg-white/20 hover:bg-white/30">Go again</Button>}
        />
      </div>
    </section>
  );
}
