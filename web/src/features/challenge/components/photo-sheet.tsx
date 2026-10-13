"use client";

import { CameraIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { formatDate } from "../dates";
import { preparePhoto } from "../images";
import { useDeletePhoto, useUploadPhoto } from "../queries";
import type { ChallengeDay } from "../stats";

type PhotoSheetProps = {
  day: ChallengeDay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Take or upload the day's progress photo. Saving it checks off the photo task.
 */
export function PhotoSheet({ day, open, onOpenChange }: PhotoSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Day ${day.number} photo`}
      description={formatDate(day.date, { weekday: "long", month: "long", day: "numeric" })}
    >
      <PhotoPicker day={day} />
    </Sheet>
  );
}

export function PhotoPicker({ day }: { day: ChallengeDay }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadPhoto();
  const remove = useDeletePhoto();
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const busy = preparing || upload.isPending;

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setPreparing(true);
    try {
      const prepared = await preparePhoto(file);
      await upload.mutateAsync({ date: day.date, ...prepared });
      navigator.vibrate?.(12);
      toast.success("Progress photo saved.");
    } catch (error) {
      toast.error(errorMessage(error, "That photo didn’t upload. Try again."));
    } finally {
      setPreparing(false);
      setPreview(null);
      if (input.current) input.current.value = "";
    }
  };

  const src = preview ?? day.photo?.url;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => onFile(event.target.files?.[0])}
      />

      {src ? (
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- private, session-authenticated image */}
          <img
            src={src}
            alt={`Progress photo for day ${day.number}`}
            className="size-full animate-[rise-in_400ms_var(--ease-out-soft)] object-cover"
          />
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[15px] font-semibold text-white">
                <Spinner /> Saving
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-3xl bg-card text-center transition-transform duration-200 active:scale-[0.98] in-[.dark_[data-sheet]]:bg-muted"
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
            <CameraIcon className="size-8" />
          </span>
          <span className="text-lg font-bold">Take today’s photo</span>
          <span className="max-w-56 text-[15px] font-normal text-muted-foreground">
            Same spot and lighting each day makes the change easier to see.
          </span>
        </button>
      )}

      <div className={day.photo ? "grid grid-cols-2 gap-2" : "grid"}>
        <Button size="lg" disabled={busy} onClick={() => input.current?.click()}>
          <CameraIcon /> {day.photo ? "Retake" : "Choose photo"}
        </Button>
        {day.photo && (
          <Button
            size="lg"
            variant="destructive"
            disabled={busy || remove.isPending}
            onClick={() =>
              remove.mutate(day.photo!.id, {
                onError: (error) => toast.error(errorMessage(error)),
              })
            }
          >
            <Trash2Icon /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
