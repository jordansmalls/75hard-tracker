import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { UsernameForm } from "@/features/account/components/username-form";

export const metadata: Metadata = { title: "Choose a username" };

// The layout's <AuthGuard> renders this page only after the session check.
export const instant = false;

export default function ChooseUsernamePage() {
  return (
    <AuthCard title="Choose your username" description="This is how others will find you. You can change it later.">
      <UsernameForm currentUsername={null} submitLabel="Continue" autoFocus />
    </AuthCard>
  );
}
