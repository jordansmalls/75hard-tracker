"use client";

import { CameraIcon } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/lib/api";
import { routes } from "@/lib/routes";
import { useChallenge, useToday } from "../queries";
import { getProgress } from "../stats";
import { CompareSlider } from "./compare-slider";
import { PhotoSheet } from "./photo-sheet";

const stagger = (index: number) => ({ "--i": index }) as React.CSSProperties;

export function PhotosView() {
  const { data: challenge, isPending, isError, refetch } = useChallenge();

  if (isPending) return <FullPageSpinner />;
  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="font-semibold">Couldn’t load your photos.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (!challenge) {
    return (
      <>
        <PageHeader title="Photos" />
        <EmptyCard title="No challenge yet" body="Start 75 Hard and your daily progress photos will collect here.">
          <ButtonLink href={routes.today}>Start 75 Hard</ButtonLink>
        </EmptyCard>
      </>
    );
  }

  return <ChallengePhotos challenge={challenge} />;
}

function ChallengePhotos({ challenge }: { challenge: Challenge }) {
  const today = useToday(challenge.timezone);
  const progress = getProgress(challenge, today);
  const [selected, setSelected] = useState<number>();
  const [open, setOpen] = useState(false);

  const withPhotos = progress.days.filter((day) => day.photo);
  const elapsed = progress.days.filter((day) => day.date <= today).length;
  const first = withPhotos[0];
  const latest = withPhotos.at(-1);
  const needsToday = progress.today && !progress.today.photo;

  const openDay = (number: number) => {
    setSelected(number);
    setOpen(true);
  };

  return (
    <>
      <PageHeader title="Photos" subtitle={`${withPhotos.length} of ${elapsed} ${elapsed === 1 ? "day" : "days"}`} />

      {needsToday && (
        <button
          type="button"
          onClick={() => openDay(progress.today!.number)}
          className="flex animate-rise items-center gap-4 rounded-3xl bg-primary p-5 text-left text-primary-foreground transition-transform duration-200 active:scale-[0.98]"
          style={stagger(1)}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20">
            <CameraIcon className="size-6" />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold">Take today’s photo</span>
            <span className="text-[15px] font-medium opacity-90">Day {progress.today!.number} still needs one.</span>
          </span>
        </button>
      )}

      {first && latest && first !== latest && first.photo && latest.photo && (
        <section className="flex animate-rise flex-col gap-3" style={stagger(2)}>
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight">Then and now</h2>
            <span className="text-[15px] font-semibold text-muted-foreground">Drag to compare</span>
          </div>
          <CompareSlider
            before={{ ...first.photo, day: first.number }}
            after={{ ...latest.photo, day: latest.number }}
          />
        </section>
      )}

      {withPhotos.length === 0 ? (
        !needsToday && <EmptyCard title="No photos yet" body="Your daily progress photos will show up here." />
      ) : (
        <section className="flex animate-rise flex-col gap-3" style={stagger(3)}>
          <h2 className="px-1 text-xl font-bold tracking-tight">Every day</h2>
          <ul className="grid grid-cols-3 gap-1.5">
            {withPhotos.map((day) => (
              <li key={day.number}>
                <button
                  type="button"
                  onClick={() => openDay(day.number)}
                  className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted transition-transform duration-200 outline-none focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-[0.97]"
                  aria-label={`Day ${day.number} photo`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- private, session-authenticated image */}
                  <img src={day.photo!.thumbnail_url} alt="" loading="lazy" className="size-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-1.5 text-left text-[13px] font-bold text-white">
                    Day {day.number}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && <PhotoSheet day={progress.days[selected - 1]!} open={open} onOpenChange={setOpen} />}
    </>
  );
}

function EmptyCard({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <section className="flex animate-rise flex-col items-start gap-4 rounded-3xl bg-card p-6" style={stagger(1)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-[15px] font-normal text-muted-foreground">{body}</p>
      </div>
      {children}
    </section>
  );
}
