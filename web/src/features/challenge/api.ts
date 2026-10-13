import { api, type Challenge, type Resource, type TaskKey } from "@/lib/api";
import type { StartChallengeInput } from "./schemas";

export type CheckInInput = { date: string; task: TaskKey; done: boolean };

export type DayLogInput = {
  date: string;
  water_oz?: number;
  pages?: number | null;
  book_title?: string | null;
};

export type PhotoUpload = { date: string; photo: Blob; thumbnail: Blob };

export const challengeApi = {
  async current(signal?: AbortSignal): Promise<Challenge | null> {
    const response = await api.get<Resource<Challenge | null>>("/api/v1/challenge", { signal });
    return response.data;
  },

  async start(input: StartChallengeInput): Promise<Challenge> {
    const response = await api.post<Resource<Challenge>>("/api/v1/challenges", input);
    return response.data;
  },

  async checkIn(input: CheckInInput): Promise<Challenge> {
    const response = await api.put<Resource<Challenge>>("/api/v1/challenge/check-ins", input);
    return response.data;
  },

  async updateDay({ date, ...details }: DayLogInput): Promise<Challenge> {
    const response = await api.patch<Resource<Challenge>>(`/api/v1/challenge/days/${date}`, details);
    return response.data;
  },

  async uploadPhoto({ date, photo, thumbnail }: PhotoUpload): Promise<Challenge> {
    const form = new FormData();
    form.set("date", date);
    form.set("photo", photo, "photo.jpg");
    form.set("thumbnail", thumbnail, "thumbnail.jpg");
    const response = await api.post<Resource<Challenge>>("/api/v1/challenge/photos", form);
    return response.data;
  },

  async deletePhoto(id: number): Promise<Challenge> {
    const response = await api.delete<Resource<Challenge>>(`/api/v1/challenge/photos/${id}`);
    return response.data;
  },
};
