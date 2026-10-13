import type { Metadata } from "next";
import { AccountSettings } from "./account-settings";

export const metadata: Metadata = { title: "Settings" };

// The layout's <AuthGuard> renders this page only after the session check.
export const instant = false;

export default function SettingsPage() {
  return <AccountSettings />;
}
