"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type Column = {
  key: string | number;
  value: number;
  /** Shown in the tooltip and the accessible table. */
  label: string;
  valueLabel: string;
};

type ColumnChartProps = {
  columns: Column[];
  /** Top of the scale. Defaults to the largest value. */
  max?: number;
  /** Labels under the plot, placed at column indexes. */
  ticks: { index: number; label: string }[];
  /** Describes the chart for the accessible table. */
  caption: string;
  columnHeader: string;
  valueHeader: string;
  height?: number;
};

/**
 * A single-series column chart. Columns grow from the baseline; hover, focus or tap
 * a column for its value. A visually hidden table carries the same data.
 */
export function ColumnChart({
  columns,
  max,
  ticks,
  caption,
  columnHeader,
  valueHeader,
  height = 132,
}: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const top = Math.max(max ?? Math.max(...columns.map((column) => column.value)), 1);
  const activeColumn = active === null ? null : columns[active];
  const position = active === null ? 0 : (active + 0.5) / columns.length;

  return (
    <figure className="flex flex-col gap-2">
      {/* The tooltip floats in reserved space above the plot so it never covers nearby text. */}
      <div className="relative pt-14" style={{ height: height + 56 }} onPointerLeave={() => setActive(null)}>
        {activeColumn && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 flex animate-[rise-in_200ms_var(--ease-out-soft)] flex-col rounded-xl bg-foreground px-3 py-1.5 whitespace-nowrap text-background shadow-lg"
            style={{
              left: `${position * 100}%`,
              transform: `translateX(${position < 0.2 ? "-12%" : position > 0.8 ? "-88%" : "-50%"})`,
            }}
          >
            <span className="text-[15px] font-bold tabular-nums">{activeColumn.valueLabel}</span>
            <span className="text-xs font-medium opacity-75">{activeColumn.label}</span>
          </div>
        )}
        <div className="flex h-full items-end gap-[2px]" aria-hidden>
          {columns.map((column, index) => (
            <div
              key={column.key}
              onPointerEnter={() => setActive(index)}
              onClick={() => setActive(index)}
              className="flex h-full flex-1 cursor-pointer items-end justify-center"
            >
              <span
                className={cn(
                  "block w-full max-w-6 animate-grow-up rounded-t-[4px] transition-[opacity,background-color] duration-200",
                  column.value === 0 ? "h-[3px] rounded-t-[2px] bg-track" : "bg-primary",
                  active !== null && active !== index && "opacity-40",
                )}
                style={
                  {
                    height: column.value === 0 ? undefined : `${Math.max((column.value / top) * 100, 3)}%`,
                    "--i": index,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-4" aria-hidden>
        {ticks.map((tick) => (
          <span
            key={tick.index}
            className={cn(
              "absolute top-0 text-xs font-semibold whitespace-nowrap text-muted-foreground tabular-nums",
              tick.index === 0 ? "" : tick.index >= columns.length ? "-translate-x-full" : "-translate-x-1/2",
            )}
            style={{ left: `${(tick.index / columns.length) * 100}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{columnHeader}</th>
            <th scope="col">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => (
            <tr key={column.key}>
              <th scope="row">{column.label}</th>
              <td>{column.valueLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
