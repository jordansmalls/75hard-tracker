"use client";

import { ButtonLink } from "@/components/button-link";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "@/features/auth/queries";
import { routes } from "@/lib/routes";

export function HomeActions() {
  const { data: user, isPending } = useMe();

  if (isPending) return <Spinner className="size-5 self-center text-muted-foreground" />;

  if (user) {
    return (
      <ButtonLink href={user.username ? routes.today : routes.onboarding} size="lg" className="w-full">
        Open today
      </ButtonLink>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ButtonLink href={routes.register} size="lg" className="w-full">
        Create account
      </ButtonLink>
      <ButtonLink href={routes.login} size="lg" variant="ghost" className="w-full">
        I have an account
      </ButtonLink>
    </div>
  );
}
