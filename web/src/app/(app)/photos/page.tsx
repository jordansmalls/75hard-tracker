import type { Metadata } from "next";
import { PhotosView } from "@/features/challenge/components/photos-view";

export const metadata: Metadata = { title: "Photos" };

// The layout's <AuthGuard> renders this page only after the session check.
export const instant = false;

export default function PhotosPage() {
  return <PhotosView />;
}
