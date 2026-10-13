import type { Metadata } from "next";
import { InsightsView } from "@/features/challenge/components/insights-view";

export const metadata: Metadata = { title: "Insights" };

// The layout's <AuthGuard> renders this page only after the session check.
export const instant = false;

export default function InsightsPage() {
  return <InsightsView />;
}
