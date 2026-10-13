"use client";

import { useState } from "react";
import type { ProgressPhoto } from "@/lib/api";

type CompareSliderProps = {
  before: ProgressPhoto & { day: number };
  after: ProgressPhoto & { day: number };
};

/**
 * Two photos stacked; drag across to wipe from one to the other.
 */
export function CompareSlider({ before, after }: CompareSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-[3/4] touch-pan-y overflow-hidden rounded-3xl bg-muted select-none">
      {/* eslint-disable-next-line @next/next/no-img-element -- private, session-authenticated image */}
      <img
        src={after.url}
        alt={`Day ${after.day}`}
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- private, session-authenticated image */}
      <img
        src={before.url}
        alt={`Day ${before.day}`}
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      <span className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-sm font-bold text-white backdrop-blur-md">
        Day {before.day}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-black/55 px-3 py-1 text-sm font-bold text-white backdrop-blur-md">
        Day {after.day}
      </span>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-white/90 shadow-[0_0_8px_rgb(0_0_0/0.3)]" />
        <div className="absolute top-1/2 -left-5 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Compare day ${before.day} with day ${after.day}`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
