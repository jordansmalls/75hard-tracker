"use client";

import { BookOpenIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/button-link";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/lib/api";
import { routes } from "@/lib/routes";
import { formatDate, formatHour, formatMinutes } from "../dates";
import { useChallenge, useToday } from "../queries";
import { getInsights, type Insights } from "../stats";
import { TASK_COUNT, taskByKey, tasks } from "../tasks";
import { AnimatedNumber } from "./animated-number";
import { ColumnChart } from "./column-chart";

export function InsightsView() {
  const { data: challenge, isPending, isError, refetch } = useChallenge();

  if (isPending) return <FullPageSpinner />;
  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="font-semibold">Couldn’t load your insights.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <>
        <PageHeader title="Insights" />
        <section className="flex animate-rise flex-col items-start gap-4 rounded-3xl bg-card p-6" style={stagger(1)}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Nothing to show yet</h2>
            <p className="text-[15px] font-normal text-muted-foreground">
              Start your challenge and your stats will build up here day by day.
            </p>
          </div>
          <ButtonLink href={routes.today}>Start 75 Hard</ButtonLink>
        </section>
      </>
    );
  }

  return <ChallengeInsights challenge={challenge} />;
}

function stagger(index: number) {
  return { "--i": index } as React.CSSProperties;
}

const oneDecimal = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const whole = (value: number) => Math.round(value).toLocaleString();

function ChallengeInsights({ challenge }: { challenge: Challenge }) {
  const today = useToday(challenge.timezone);
  const insights = getInsights(challenge, today);
  const percent = (insights.completedDays / challenge.length) * 100;

  const subtitle =
    challenge.attempt > 1
      ? `Attempt ${challenge.attempt} · started ${formatDate(challenge.started_on)}`
      : `Started ${formatDate(challenge.started_on, { month: "long", day: "numeric" })}`;

  return (
    <>
      <PageHeader title="Insights" subtitle={subtitle} />

      <section className="flex animate-rise flex-col gap-4 rounded-3xl bg-card p-5" style={stagger(1)}>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-6xl leading-none font-extrabold tracking-tight">
              <AnimatedNumber value={percent} format={whole} />%
            </span>
            <span className="mt-2 text-[17px] font-bold">of 75 Hard complete</span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[15px] font-bold">
              {formatDate(challenge.ends_on, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span className="text-sm font-medium text-muted-foreground">finish line</span>
          </div>
        </div>
        <div
          role="meter"
          aria-label="Days complete"
          aria-valuemin={0}
          aria-valuemax={challenge.length}
          aria-valuenow={insights.completedDays}
          className="h-3 overflow-hidden rounded-full bg-primary-soft"
        >
          <div
            className="h-full origin-left animate-[grow-x_900ms_var(--ease-out-soft)_both] rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[15px] font-medium text-muted-foreground">
          <span className="font-bold text-foreground">{insights.completedDays}</span> days done,{" "}
          <span className="font-bold text-foreground">{insights.daysLeft}</span> to go.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <StatTile
          index={2}
          label="Pages read"
          value={<AnimatedNumber value={insights.pagesRead} />}
          detail={`About ${oneDecimal(insights.books)} books`}
        />
        <StatTile
          index={3}
          label="Gallons of water"
          value={<AnimatedNumber value={insights.gallons} />}
          detail={`${insights.ounces.toLocaleString()} oz total`}
        />
        <StatTile
          index={4}
          label="Workouts"
          value={<AnimatedNumber value={insights.workouts} />}
          detail={`${oneDecimal(insights.workoutHours)} hours of training`}
        />
        <StatTile
          index={5}
          label="Current streak"
          value={<AnimatedNumber value={insights.currentStreak} />}
          detail={`Best run: ${insights.longestStreak} ${insights.longestStreak === 1 ? "day" : "days"}`}
        />
        <StatTile
          index={6}
          label="Perfect days"
          value={
            insights.perfectRate === null ? (
              "–"
            ) : (
              <>
                <AnimatedNumber value={insights.perfectRate * 100} format={whole} />%
              </>
            )
          }
          detail={insights.perfectRate === null ? "Counts from tomorrow" : "All seven tasks done"}
        />
        <StatTile
          index={7}
          label="Progress photos"
          value={<AnimatedNumber value={insights.photos} />}
          detail={insights.photos > 1 ? "Compare day 1 to now" : "Your story, day by day"}
        />
      </div>

      <ReadingCard insights={insights} />
      <BooksCard insights={insights} />
      <RhythmCard insights={insights} />
      <ConsistencyCard insights={insights} />
    </>
  );
}

function StatTile({ label, value, detail, index }: { label: string; value: ReactNode; detail: string; index: number }) {
  return (
    <div className="flex animate-rise flex-col rounded-2xl bg-card p-4" style={stagger(index)}>
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="mt-2 text-[34px] leading-none font-extrabold tracking-tight">{value}</span>
      <span className="mt-2 text-[13px] leading-snug font-medium text-muted-foreground">{detail}</span>
    </div>
  );
}

function Card({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <section className="flex animate-rise flex-col gap-4 rounded-3xl bg-card p-5" style={stagger(index)}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-[15px] font-normal text-muted-foreground">{children}</p>;
}

function ReadingCard({ insights }: { insights: Insights }) {
  const reading = insights.timings.find((timing) => timing.task === "reading")!;

  return (
    <Card title="When you read" index={8}>
      {reading.averageMinute === null ? (
        <EmptyNote>Check off your reading on the day you do it and your reading time shows up here.</EmptyNote>
      ) : (
        <>
          <div className="flex flex-col">
            <span className="text-5xl leading-none font-extrabold tracking-tight">
              {formatMinutes(reading.averageMinute)}
            </span>
            <span className="mt-2 text-[15px] font-medium text-muted-foreground">
              is your average reading time
              {insights.peakReadingHour !== null && (
                <>
                  , most often in the{" "}
                  <span className="font-bold text-foreground">{formatHour(insights.peakReadingHour)}</span> hour
                </>
              )}
              .
            </span>
          </div>
          <ColumnChart
            caption="Reading check-offs by hour of the day"
            columnHeader="Hour"
            valueHeader="Days"
            columns={insights.readingByHour.map((count, hour) => ({
              key: hour,
              value: count,
              label: `${formatHour(hour)} to ${formatHour((hour + 1) % 24)}`,
              valueLabel: `${count} ${count === 1 ? "day" : "days"}`,
            }))}
            ticks={[
              { index: 0, label: "12 AM" },
              { index: 6, label: "6 AM" },
              { index: 12, label: "12 PM" },
              { index: 18, label: "6 PM" },
            ]}
          />
        </>
      )}
    </Card>
  );
}

function BooksCard({ insights }: { insights: Insights }) {
  const books = insights.bookList;

  return (
    <Card title={books.length === 1 ? "Your book" : "Your books"} index={9}>
      {books.length === 0 ? (
        <EmptyNote>Tap “Read 10 pages” on the Today tab to log the book and how many pages you read.</EmptyNote>
      ) : (
        <ul className="flex flex-col gap-1">
          {books.map((book, index) => (
            <li key={book.title} className="flex items-center gap-3 py-1.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <BookOpenIcon className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-base font-semibold">{book.title}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {index === 0 ? "Reading now · " : ""}
                  {book.days} {book.days === 1 ? "day" : "days"}
                </span>
              </span>
              <span className="text-base font-bold tabular-nums">
                {book.pages.toLocaleString()} <span className="font-medium text-muted-foreground">pp</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RhythmCard({ insights }: { insights: Insights }) {
  const timed = insights.timings.filter((timing) => timing.averageMinute !== null);

  return (
    <Card title="Daily rhythm" index={10}>
      {timed.length === 0 ? (
        <EmptyNote>Average check-off times appear once you’ve logged tasks on the day you did them.</EmptyNote>
      ) : (
        <>
          {(insights.averageWrapUp !== null || insights.usuallyFirst || insights.usuallyLast) && (
            <div className="grid grid-cols-2 gap-2">
              {insights.usuallyFirst && (
                <Highlight label="Done first" value={taskByKey[insights.usuallyFirst].shortTitle} />
              )}
              {insights.usuallyLast && (
                <Highlight label="Saved for last" value={taskByKey[insights.usuallyLast].shortTitle} />
              )}
              {insights.averageWrapUp !== null && (
                <Highlight label="Day wrapped by" value={formatMinutes(insights.averageWrapUp)} wide />
              )}
            </div>
          )}
          <ul className="flex flex-col gap-1">
            {tasks.map(({ key, shortTitle, icon: Icon }) => {
              const timing = insights.timings.find((item) => item.task === key)!;
              return (
                <li key={key} className="flex items-center gap-3 py-1.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex-1 text-base font-semibold">{shortTitle}</span>
                  <span className="text-base font-bold tabular-nums">
                    {timing.averageMinute === null ? (
                      <span className="font-medium text-muted-foreground">–</span>
                    ) : (
                      formatMinutes(timing.averageMinute)
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <EmptyNote>Average time each task gets checked off.</EmptyNote>
        </>
      )}
    </Card>
  );
}

function Highlight({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div
      className={
        wide ? "col-span-2 flex flex-col rounded-2xl bg-muted p-3.5" : "flex flex-col rounded-2xl bg-muted p-3.5"
      }
    >
      <span className="text-[13px] font-semibold text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function ConsistencyCard({ insights }: { insights: Insights }) {
  const totals = insights.dailyTotals;

  return (
    <Card title="Tasks per day" index={11}>
      {totals.length === 0 ? (
        <EmptyNote>Your challenge hasn’t started yet.</EmptyNote>
      ) : (
        <>
          <ColumnChart
            caption="Tasks checked off each day"
            columnHeader="Day"
            valueHeader="Tasks"
            max={TASK_COUNT}
            height={112}
            columns={totals.map((day) => ({
              key: day.day,
              value: day.done,
              label: `Day ${day.day} · ${formatDate(day.date, { weekday: "short", month: "short", day: "numeric" })}`,
              valueLabel: `${day.done} of ${TASK_COUNT}`,
            }))}
            ticks={
              totals.length > 1
                ? [
                    { index: 0, label: "Day 1" },
                    { index: totals.length, label: `Day ${totals.length}` },
                  ]
                : [{ index: 0, label: "Day 1" }]
            }
          />
          <EmptyNote>Full bars are days where all seven got done.</EmptyNote>
        </>
      )}
    </Card>
  );
}
