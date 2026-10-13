import { describe, expect, it } from "vitest";
import type { Challenge, CheckIn, DayLog, TaskKey } from "@/lib/api";
import { addDays, daysBetween, formatMinutes, minuteOfDayIn, todayIn } from "./dates";
import { averageMinuteOfDay, getInsights, getProgress, latestBookTitle } from "./stats";
import { tasks } from "./tasks";

const allTasks = tasks.map((task) => task.key);

function challenge(checkIns: CheckIn[], startedOn = "2026-10-01", dayLogs: DayLog[] = []): Challenge {
  return {
    id: 1,
    started_on: startedOn,
    ends_on: addDays(startedOn, 74),
    length: 75,
    timezone: "America/New_York",
    status: "active",
    attempt: 1,
    check_ins: checkIns,
    day_logs: dayLogs,
    photos: [],
    created_at: "",
    updated_at: "",
  };
}

function checkIn(date: string, task: TaskKey, minute: number | null = null): CheckIn {
  return { date, task, checked_at: minute === null ? null : "2026-10-01T00:00:00Z", minute_of_day: minute };
}

/** Every task for each date, checked off at `minute` + the task's index. */
function fullDays(dates: string[], minute: number | null = null): CheckIn[] {
  return dates.flatMap((date) =>
    allTasks.map((task, index) => checkIn(date, task, minute === null ? null : minute + index)),
  );
}

describe("dates", () => {
  it("does calendar math on date strings", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(daysBetween("2026-10-01", "2026-12-14")).toBe(74);
  });

  it("reads the date and time in a timezone", () => {
    const now = new Date("2026-10-13T03:30:00Z");
    expect(todayIn("America/Los_Angeles", now)).toBe("2026-10-12");
    expect(todayIn("Europe/Berlin", now)).toBe("2026-10-13");
    expect(minuteOfDayIn("UTC", now)).toBe(3 * 60 + 30);
  });

  it("formats minutes as a clock time", () => {
    expect(formatMinutes(0)).toBe("12:00 AM");
    expect(formatMinutes(452)).toBe("7:32 AM");
    expect(formatMinutes(20 * 60 + 5)).toBe("8:05 PM");
  });
});

describe("getProgress", () => {
  it("counts finished days, what's left and the streak", () => {
    const today = "2026-10-04";
    const progress = getProgress(
      challenge([...fullDays(["2026-10-01", "2026-10-02", "2026-10-03"]), checkIn(today, "reading")]),
      today,
    );

    expect(progress.completedDays).toBe(3);
    expect(progress.daysLeft).toBe(72);
    expect(progress.today?.number).toBe(4);
    expect(progress.today?.status).toBe("today");
    expect(progress.currentStreak).toBe(3);
    expect(progress.firstMissed).toBeUndefined();
    expect(progress.pagesRead).toBe(40);
    expect(progress.gallons).toBe(3);
  });

  it("includes today in the streak once it's complete", () => {
    const progress = getProgress(challenge(fullDays(["2026-10-01", "2026-10-02"])), "2026-10-02");
    expect(progress.currentStreak).toBe(2);
    expect(progress.today?.status).toBe("complete");
  });

  it("flags the first unfinished past day", () => {
    const checkIns = [...fullDays(["2026-10-01", "2026-10-03"]), checkIn("2026-10-02", "water")];
    const progress = getProgress(challenge(checkIns), "2026-10-04");

    expect(progress.firstMissed?.number).toBe(2);
    expect(progress.currentStreak).toBe(1);
    expect(progress.longestStreak).toBe(1);
  });

  it("knows when all 75 days are done", () => {
    const dates = Array.from({ length: 75 }, (_, index) => addDays("2026-10-01", index));
    const progress = getProgress(challenge(fullDays(dates)), "2026-12-20");

    expect(progress.isFinished).toBe(true);
    expect(progress.today).toBeUndefined();
    expect(progress.daysLeft).toBe(0);
  });
});

describe("averageMinuteOfDay", () => {
  it("averages around midnight instead of noon", () => {
    expect(averageMinuteOfDay([23 * 60, 1 * 60])).toBe(0);
    expect(averageMinuteOfDay([7 * 60, 8 * 60])).toBe(7 * 60 + 30);
  });

  it("returns null without data", () => {
    expect(averageMinuteOfDay([])).toBeNull();
  });
});

describe("getInsights", () => {
  it("summarizes totals, timing and rhythm", () => {
    const today = "2026-10-03";
    const insights = getInsights(
      challenge([
        ...fullDays(["2026-10-01"], 7 * 60),
        ...fullDays(["2026-10-02"], 8 * 60),
        checkIn(today, "reading", 6 * 60 + 45),
      ]),
      today,
    );

    expect(insights.elapsedDays).toBe(3);
    expect(insights.pagesRead).toBe(30);
    expect(insights.workouts).toBe(4);
    expect(insights.workoutHours).toBe(3);
    expect(insights.ounces).toBe(256);
    expect(insights.perfectRate).toBe(1);
    expect(insights.readingByHour[7]).toBe(1);
    expect(insights.readingByHour[8]).toBe(1);
    expect(insights.readingByHour[6]).toBe(1);
    expect(insights.timings.find((timing) => timing.task === "reading")?.samples).toBe(3);
    expect(insights.usuallyFirst).toBe("reading");
    expect(insights.usuallyLast).toBe("no_alcohol");
    expect(insights.averageWrapUp).toBe(7 * 60 + 30 + 6);
    expect(insights.dailyTotals.map((day) => day.done)).toEqual([7, 7, 1]);
  });

  it("leaves timing empty for days logged after the fact", () => {
    const insights = getInsights(challenge(fullDays(["2026-10-01"])), "2026-10-02");

    expect(insights.peakReadingHour).toBeNull();
    expect(insights.averageWrapUp).toBeNull();
    expect(insights.timings.every((timing) => timing.averageMinute === null)).toBe(true);
  });
});

describe("logged details", () => {
  const log = (date: string, details: Partial<DayLog>): DayLog => ({
    date,
    water_oz: 0,
    pages: null,
    book_title: null,
    ...details,
  });

  it("counts logged pages, and 10 for reading days without a number", () => {
    const checkIns = fullDays(["2026-10-01", "2026-10-02", "2026-10-03"]);
    const logs = [
      log("2026-10-01", { pages: 25, book_title: "Deep Work" }),
      log("2026-10-02", { pages: 12, book_title: "Atomic Habits" }),
    ];
    const insights = getInsights(challenge(checkIns, "2026-10-01", logs), "2026-10-04");

    expect(insights.pagesRead).toBe(25 + 12 + 10);
    expect(insights.bookList.map((book) => book.title)).toEqual(["Atomic Habits", "Deep Work"]);
    expect(insights.bookList[1]).toMatchObject({ pages: 25, days: 1 });
  });

  it("ignores logged pages on days reading wasn't checked off", () => {
    const progress = getProgress(challenge([], "2026-10-01", [log("2026-10-01", { pages: 40 })]), "2026-10-02");
    expect(progress.pagesRead).toBe(0);
  });

  it("adds up logged water, counting a full gallon when it was just checked off", () => {
    const checkIns = [checkIn("2026-10-01", "water"), checkIn("2026-10-02", "water")];
    const logs = [log("2026-10-02", { water_oz: 160 }), log("2026-10-03", { water_oz: 40 })];
    const insights = getInsights(challenge(checkIns, "2026-10-01", logs), "2026-10-03");

    expect(insights.ounces).toBe(128 + 160 + 40);
    expect(insights.gallons).toBe(2);
  });

  it("suggests the most recent book", () => {
    const logs = [log("2026-10-01", { book_title: "Deep Work" }), log("2026-10-02", { water_oz: 32 })];
    expect(latestBookTitle(challenge([], "2026-10-01", logs))).toBe("Deep Work");
  });
});
