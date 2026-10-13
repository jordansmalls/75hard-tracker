"use client";

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Challenge, CheckIn, DayLog, TaskKey } from "@/lib/api";
import { challengeApi, type CheckInInput, type DayLogInput } from "./api";
import { minuteOfDayIn, todayIn } from "./dates";
import { OUNCES_PER_GALLON } from "./stats";

export const challengeKeys = {
  all: ["challenge"] as const,
  current: () => [...challengeKeys.all, "current"] as const,
};

/** Every mutation that edits the current challenge shares this key. */
const editMutationKey = [...challengeKeys.all, "edit"] as const;

export const challengeQueryOptions = queryOptions({
  queryKey: challengeKeys.current(),
  queryFn: ({ signal }) => challengeApi.current(signal),
});

/** The current challenge. `data` is `null` if the user hasn't started one. */
export function useChallenge() {
  return useQuery(challengeQueryOptions);
}

export function useStartChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: challengeApi.start,
    onSuccess: (challenge) => queryClient.setQueryData(challengeKeys.current(), challenge),
  });
}

/**
 * A change to the current challenge that shows up immediately (`apply`) and rolls back on failure.
 * Responses from the server only replace the cache once no other edits are in flight,
 * so quick successive taps never flicker back to an older state.
 */
function useChallengeEdit<TInput>(
  mutationFn: (input: TInput) => Promise<Challenge>,
  apply?: (challenge: Challenge, input: TInput) => Challenge,
) {
  const queryClient = useQueryClient();
  const key = challengeKeys.current();

  return useMutation({
    mutationKey: editMutationKey,
    mutationFn,
    onMutate: async (input: TInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Challenge | null>(key);
      if (previous && apply) queryClient.setQueryData(key, apply(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (challenge) => {
      if (queryClient.isMutating({ mutationKey: editMutationKey }) === 1) {
        queryClient.setQueryData(key, challenge);
      }
    },
  });
}

/** Check a task off (or uncheck it). */
export function useCheckIn() {
  return useChallengeEdit(challengeApi.checkIn, applyCheckIn);
}

/** Log water or reading details for a day. Mirrors the server's automatic check-offs. */
export function useUpdateDay() {
  return useChallengeEdit(challengeApi.updateDay, applyDayLog);
}

export function useUploadPhoto() {
  return useChallengeEdit(challengeApi.uploadPhoto);
}

export function useDeletePhoto() {
  return useChallengeEdit(challengeApi.deletePhoto, (challenge, id: number) => ({
    ...challenge,
    photos: challenge.photos.filter((photo) => photo.id !== id),
  }));
}

function applyCheckIn(challenge: Challenge, { date, task, done }: CheckInInput): Challenge {
  const others = challenge.check_ins.filter((checkIn) => checkIn.date !== date || checkIn.task !== task);
  if (!done) return { ...challenge, check_ins: others };

  const existing = challenge.check_ins.find((checkIn) => checkIn.date === date && checkIn.task === task);
  return { ...challenge, check_ins: [...others, existing ?? newCheckIn(challenge, date, task)] };
}

function newCheckIn(challenge: Challenge, date: string, task: TaskKey): CheckIn {
  const isToday = date === todayIn(challenge.timezone);
  return {
    date,
    task,
    checked_at: isToday ? new Date().toISOString() : null,
    minute_of_day: isToday ? minuteOfDayIn(challenge.timezone) : null,
  };
}

function applyDayLog(challenge: Challenge, { date, ...details }: DayLogInput): Challenge {
  const previous = challenge.day_logs.find((log) => log.date === date);
  const log: DayLog = { date, water_oz: 0, pages: null, book_title: null, ...previous, ...details };
  let next: Challenge = {
    ...challenge,
    day_logs: [...challenge.day_logs.filter((entry) => entry.date !== date), log],
  };

  if (details.water_oz !== undefined) {
    const wasFull = (previous?.water_oz ?? 0) >= OUNCES_PER_GALLON;
    const isFull = details.water_oz >= OUNCES_PER_GALLON;
    if (isFull !== wasFull) next = applyCheckIn(next, { date, task: "water", done: isFull });
  }
  if (details.pages) next = applyCheckIn(next, { date, task: "reading", done: true });

  return next;
}

/**
 * Today's date in the challenge's timezone, kept current past midnight.
 */
export function useToday(timeZone: string): string {
  const [today, setToday] = useState(() => todayIn(timeZone));

  useEffect(() => {
    const update = () => setToday(todayIn(timeZone));
    update();
    const interval = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [timeZone]);

  return today;
}
