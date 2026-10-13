import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";
import { routes } from "@/lib/routes";

/**
 * Centered single-column layout for sign in, sign up and onboarding screens.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
      <Link href={routes.home} className="animate-rise text-2xl font-extrabold tracking-tight">
        {siteConfig.name}
      </Link>
      <main className="flex w-full max-w-md animate-rise flex-col" style={{ "--i": 1 } as React.CSSProperties}>
        {children}
      </main>
    </div>
  );
}
