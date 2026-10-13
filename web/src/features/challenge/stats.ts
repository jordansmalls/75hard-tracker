import type { Challenge, CheckIn, DayLog, ProgressPhoto, TaskKey } from "@/lib/api";
import { addDays, daysBetween } from "./dates";
import { TASK_COUNT, tasks } from "./tasks";

export const PAGES_PER_DAY = 10;
export const WORKOUT_MINUTES = 45;
export const OUNCES_PER_GALLON = 128;
/** A typical nonfiction book, for the "books read" comparison. */
export const PAGES_PER_BOOK = 250;

export type DayStatus = "complete" | "today" | "missed" | "upcoming";

export type ChallengeDay = {
  /** 1–75. */
  number: number;
  date: string;
  done: ReadonlySet<TaskKey>;
  status: DayStatus;
  /** Water and reading details, if any were logged. */
  log: DayLog | undefined;
  photo: ProgressPhoto | undefined;
};

/** Every day of the challenge with what was done and where it stands relative to `today`. */
export function buildDays(challenge: Challenge, today: string): ChallengeDay[] {
  const doneByDate = new Map<string, Set<TaskKey>>();
  for (const checkIn of challenge.check_ins) {
    const done = doneByDate.get(checkIn.date) ?? new Set<TaskKey>();
    done.add(checkIn.task);
    doneByDate.set(checkIn.date, done);
  }
  const logs = new Map(challenge.day_logs.map((log) => [log.date, log]));
  const photos = new Map(challenge.photos.map((photo) => [photo.date, photo]));

  return Array.from({ length: challenge.length }, (_, index) => {
    const date = addDays(challenge.started_on, index);
    const done = doneByDate.get(date) ?? new Set<TaskKey>();
    const status: DayStatus =
      done.size === TASK_COUNT ? "complete" : date === today ? "today" : date < today ? "missed" : "upcoming";
    return { number: index + 1, date, done, status, log: logs.get(date), photo: photos.get(date) };
  });
}

export type Progress = {
  days: ChallengeDay[];
  /** Today's entry, or `undefined` once the 75 days are over. */
  today: ChallengeDay | undefined;
  completedDays: number;
  daysLeft: number;
  /** The earliest day that was not finished. Under 75 Hard rules this means starting over. */
  firstMissed: ChallengeDay | undefined;
  isFinished: boolean;
  currentStreak: number;
  longestStreak: number;
  pagesRead: number;
  gallons: number;
};

export function getProgress(challenge: Challenge, today: string): Progress {
  const days = buildDays(challenge, today);
  const completedDays = days.filter((day) => day.status === "complete").length;
  const { current, longest } = streaks(days, today);

  return {
    days,
    today: days.find((day) => day.date === today),
    completedDays,
    daysLeft: challenge.length - completedDays,
    firstMissed: days.find((day) => day.status === "missed"),
    isFinished: completedDays === challenge.length,
    currentStreak: current,
    longestStreak: longest,
    pagesRead: pagesRead(days),
    gallons: countTask(challenge.check_ins, "water"),
  };
}

/** Logged pages on days reading was checked off, counting 10 where no number was logged. */
function pagesRead(days: ChallengeDay[]): number {
  return days.reduce((total, day) => total + (day.done.has("reading") ? (day.log?.pages ?? PAGES_PER_DAY) : 0), 0);
}

/** The most recently logged book title, to suggest for today. */
export function latestBookTitle(challenge: Challenge): string | null {
  return challenge.day_logs.findLast((log) => log.book_title)?.book_title ?? null;
}

export type BookSummary = { title: string; pages: number; days: number; lastRead: string };

/** Books logged during the challenge, most recently read first. */
export function booksRead(days: ChallengeDay[]): BookSummary[] {
  const books = new Map<string, BookSummary>();
  for (const day of days) {
    const title = day.log?.book_title;
    if (!title) continue;
    const book = books.get(title) ?? { title, pages: 0, days: 0, lastRead: day.date };
    book.pages += day.log?.pages ?? PAGES_PER_DAY;
    book.days += 1;
    book.lastRead = day.date;
    books.set(title, book);
  }
  return [...books.values()].sort((a, b) => b.lastRead.localeCompare(a.lastRead));
}

function countTask(checkIns: CheckIn[], task: TaskKey): number {
  return checkIns.filter((checkIn) => checkIn.task === task).length;
}

/**
 * Complete days in a row. The current streak runs up to today, or up to yesterday
 * while today is still in progress.
 */
function streaks(days: ChallengeDay[], today: string): { current: number; longest: number } {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.status === "complete" ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const elapsed = days.filter((day) => day.date <= today);
  const last = elapsed.at(-1);
  const closed = last && last.date === today && last.status !== "complete" ? elapsed.slice(0, -1) : elapsed;

  let current = 0;
  for (let index = closed.length - 1; index >= 0 && closed[index]!.status === "complete"; index--) {
    current++;
  }

  return { current, longest };
}

const MINUTES_PER_DAY = 24 * 60;

/**
 * The average time of day, treating the clock as a circle so 11 PM and 1 AM
 * average to midnight rather than noon. `null` when there's nothing to average.
 */
export function averageMinuteOfDay(minutes: number[]): number | null {
  if (minutes.length === 0) return null;

  let x = 0;
  let y = 0;
  for (const minute of minutes) {
    const angle = (minute / MINUTES_PER_DAY) * 2 * Math.PI;
    x += Math.cos(angle);
    y += Math.sin(angle);
  }

  // Times spread evenly around the clock have no meaningful average.
  if (Math.hypot(x, y) / minutes.length < 1e-6) return null;

  const angle = Math.atan2(y, x);
  const minute = (angle / (2 * Math.PI)) * MINUTES_PER_DAY;
  return Math.round((minute + MINUTES_PER_DAY) % MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export type TaskTiming = {
  task: TaskKey;
  /** Average minute of day it gets checked off, or `null` without same-day data. */
  averageMinute: number | null;
  /** Times it was checked off on the day it was done. */
  samples: number;
};

export type Insights = Progress & {
  /** How far into the 75 days the challenge is (0–1), counting today. */
  fractionElapsed: number;
  /** Days up to and including today. */
  elapsedDays: number;
  ounces: number;
  books: number;
  bookList: BookSummary[];
  workouts: number;
  workoutHours: number;
  photos: number;
  /** Complete days divided by finished days (before today), or `null` on day 1. */
  perfectRate: number | null;
  /** Reading check-offs per hour of the day (24 buckets). */
  readingByHour: number[];
  /** Hour with the most reading check-offs, or `null` without data. */
  peakReadingHour: number | null;
  timings: TaskTiming[];
  /** Average time the last task of a complete day gets checked off. */
  averageWrapUp: number | null;
  /** The task most often checked off first and last on complete days. */
  usuallyFirst: TaskKey | null;
  usuallyLast: TaskKey | null;
  /** Tasks done on each day up to today, oldest first. */
  dailyTotals: { day: number; date: string; done: number }[];
};

export function getInsights(challenge: Challenge, today: string): Insights {
  const progress = getProgress(challenge, today);
  const { check_ins: checkIns } = challenge;

  const elapsedDays = Math.min(Math.max(daysBetween(challenge.started_on, today) + 1, 0), challenge.length);
  const closedDays = progress.days.filter((day) => day.date < today).length;
  const closedComplete = progress.days.filter((day) => day.date < today && day.status === "complete").length;

  const timed = checkIns.filter(
    (checkIn): checkIn is CheckIn & { minute_of_day: number } => checkIn.minute_of_day !== null,
  );

  const readingByHour = Array.from({ length: 24 }, () => 0);
  for (const checkIn of timed) {
    if (checkIn.task === "reading") readingByHour[Math.floor(checkIn.minute_of_day / 60)]!++;
  }
  const peakCount = Math.max(...readingByHour);

  const timings = tasks.map(({ key }) => {
    const minutes = timed.filter((checkIn) => checkIn.task === key).map((checkIn) => checkIn.minute_of_day);
    return { task: key, averageMinute: averageMinuteOfDay(minutes), samples: minutes.length };
  });

  const workouts = countTask(checkIns, "workout_one") + countTask(checkIns, "workout_two");

  return {
    ...progress,
    fractionElapsed: elapsedDays / challenge.length,
    elapsedDays,
    books: progress.pagesRead / PAGES_PER_BOOK,
    bookList: booksRead(progress.days),
    // Logged ounces, or a full gallon on days water was simply checked off.
    ounces: progress.days.reduce(
      (total, day) => total + Math.max(day.log?.water_oz ?? 0, day.done.has("water") ? OUNCES_PER_GALLON : 0),
      0,
    ),
    workouts,
    workoutHours: (workouts * WORKOUT_MINUTES) / 60,
    photos: countTask(checkIns, "photo"),
    perfectRate: closedDays > 0 ? closedComplete / closedDays : null,
    readingByHour,
    peakReadingHour: peakCount > 0 ? readingByHour.indexOf(peakCount) : null,
    timings,
    ...dayShape(timed, progress.days),
    dailyTotals: progress.days
      .filter((day) => day.date <= today)
      .map((day) => ({ day: day.number, date: day.date, done: day.done.size })),
  };
}

/** When complete days wrap up, and which tasks tend to open and close them. */
function dayShape(
  timed: (CheckIn & { minute_of_day: number })[],
  days: ChallengeDay[],
): Pick<Insights, "averageWrapUp" | "usuallyFirst" | "usuallyLast"> {
  const byDate = new Map<string, (CheckIn & { minute_of_day: number })[]>();
  for (const checkIn of timed) {
    byDate.set(checkIn.date, [...(byDate.get(checkIn.date) ?? []), checkIn]);
  }
  const wrapUps: number[] = [];
  const firsts = new Map<TaskKey, number>();
  const lasts = new Map<TaskKey, number>();

  for (const day of days) {
    const entries = byDate.get(day.date);
    // Only days where every task was checked off on the day give a full picture.
    if (day.status !== "complete" || !entries || entries.length < TASK_COUNT) continue;

    const ordered = [...entries].sort((a, b) => a.minute_of_day - b.minute_of_day);
    const first = ordered[0]!;
    const last = ordered.at(-1)!;
    wrapUps.push(last.minute_of_day);
    firsts.set(first.task, (firsts.get(first.task) ?? 0) + 1);
    lasts.set(last.task, (lasts.get(last.task) ?? 0) + 1);
  }

  return {
    averageWrapUp: averageMinuteOfDay(wrapUps),
    usuallyFirst: mostCommon(firsts),
    usuallyLast: mostCommon(lasts),
  };
}

function mostCommon(counts: Map<TaskKey, number>): TaskKey | null {
  let best: TaskKey | null = null;
  let bestCount = 0;
  for (const [task, count] of counts) {
    if (count > bestCount) {
      best = task;
      bestCount = count;
    }
  }
  return best;
}
