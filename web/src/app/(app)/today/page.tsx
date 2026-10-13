import type { Metadata } from "next";
import { TodayView } from "@/features/challenge/components/today-view";

export const metadata: Metadata = { title: "Today" };

// The layout's <AuthGuard> renders this page only after the session check.
export const instant = false;

export default function TodayPage() {
  return <TodayView />;
}
