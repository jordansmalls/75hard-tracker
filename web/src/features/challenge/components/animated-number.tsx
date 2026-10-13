"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  format?: (value: number) => string;
  duration?: number;
};

const defaultFormat = (value: number) => Math.round(value).toLocaleString();

/**
 * Counts up to `value` with an ease-out curve. Jumps straight there when motion is reduced.
 */
export function AnimatedNumber({ value, format = defaultFormat, duration = 900 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = from.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || start === value) {
      from.current = value;
      setDisplay(value);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(start + (value - start) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      from.current = value;
    };
  }, [value, duration]);

  return <>{format(display)}</>;
}
