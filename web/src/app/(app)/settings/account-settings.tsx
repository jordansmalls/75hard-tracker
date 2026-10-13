"use client";

import { LogOutIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsSection } from "@/components/settings-section";
import { Button } from "@/components/ui/button";
import { DeleteAccountForm } from "@/features/account/components/delete-account-form";
import { PasswordForm } from "@/features/account/components/password-form";
import { ProfileForm } from "@/features/account/components/profile-form";
import { UsernameForm } from "@/features/account/components/username-form";
import { useLogout, useUser } from "@/features/auth/queries";
import { AppearanceSetting } from "@/features/challenge/components/appearance-setting";
import { ChallengeSettings } from "@/features/challenge/components/challenge-settings";

const stagger = (index: number) => ({ "--i": index }) as React.CSSProperties;

export function AccountSettings() {
  const user = useUser();
  const logout = useLogout();

  return (
    <>
      <PageHeader title="Settings" subtitle={user.name ?? `@${user.username}`} />
      <ChallengeSettings style={stagger(1)} />
      <SettingsSection title="Appearance" style={stagger(2)}>
        <AppearanceSetting />
      </SettingsSection>
      <SettingsSection title="Profile" description="Your name and email address." style={stagger(3)}>
        <ProfileForm user={user} />
      </SettingsSection>
      <SettingsSection title="Username" description="Your unique handle." style={stagger(4)}>
        <UsernameForm currentUsername={user.username} />
      </SettingsSection>
      <SettingsSection title="Password" description="Changing it signs out your other devices." style={stagger(5)}>
        <PasswordForm />
      </SettingsSection>
      <Button
        size="lg"
        variant="outline"
        className="w-full animate-rise"
        style={stagger(6)}
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOutIcon /> Sign out
      </Button>
      <SettingsSection
        title="Delete account"
        description="Permanently deletes your account and every challenge. This can’t be undone."
        style={stagger(7)}
      >
        <DeleteAccountForm />
      </SettingsSection>
    </>
  );
}
