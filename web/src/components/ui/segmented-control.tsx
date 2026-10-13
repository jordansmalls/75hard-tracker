"use client";

import { cn } from "@/lib/utils";

type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
  className?: string;
};

/**
 * iOS-style segmented control with a sliding thumb.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  const index = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  return (
    <div role="radiogroup" aria-label={label} className={cn("relative grid rounded-xl bg-muted p-0.5", className)} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-[10px] bg-card shadow-[0_3px_8px_rgb(0_0_0/0.12),0_1px_1px_rgb(0_0_0/0.04)] transition-transform duration-300 ease-(--ease-out-soft) dark:bg-[#636366]"
        style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative z-1 h-9 rounded-[10px] text-[15px] transition-[font-weight,color] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-primary/40",
              selected ? "font-bold" : "font-medium text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
