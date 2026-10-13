/** Laravel API resources are wrapped in `data`. */
export type Resource<T> = { data: T };

export type MessageResponse = { message: string };

export type User = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityReason = "taken" | "reserved";

export type Availability = {
  available: boolean;
  reason: AvailabilityReason | null;
};

export type TaskKey = "reading" | "photo" | "water" | "workout_one" | "workout_two" | "diet" | "no_alcohol";

export type CheckIn = {
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string;
  task: TaskKey;
  /** When it was checked off. `null` if it was logged on a later day. */
  checked_at: string | null;
  /** Minutes after local midnight it was checked off, in the challenge's timezone. */
  minute_of_day: number | null;
};

export type DayLog = {
  date: string;
  water_oz: number;
  pages: number | null;
  book_title: string | null;
};

export type ProgressPhoto = {
  id: number;
  date: string;
  /** Same-origin API paths, served with the session cookie. */
  url: string;
  thumbnail_url: string;
};

export type Challenge = {
  id: number;
  started_on: string;
  ends_on: string;
  length: number;
  timezone: string;
  status: "active" | "abandoned";
  attempt: number;
  check_ins: CheckIn[];
  day_logs: DayLog[];
  photos: ProgressPhoto[];
  created_at: string;
  updated_at: string;
};
