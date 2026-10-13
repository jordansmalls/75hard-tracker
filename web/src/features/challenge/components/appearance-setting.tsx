"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";

const themes = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Theme = (typeof themes)[number]["value"];

const subscribe = () => () => {};

export function AppearanceSetting() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known in the browser.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <SegmentedControl
      label="Appearance"
      value={(mounted ? theme : "system") as Theme}
      onValueChange={setTheme}
      options={themes}
    />
  );
}
