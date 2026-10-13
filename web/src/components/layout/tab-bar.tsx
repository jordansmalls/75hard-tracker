"use client";

import { ChartColumnIcon, CircleCheckBigIcon, ImagesIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const tabs = [
  { href: routes.today, label: "Today", icon: CircleCheckBigIcon },
  { href: routes.photos, label: "Photos", icon: ImagesIcon },
  { href: routes.insights, label: "Insights", icon: ChartColumnIcon },
  { href: routes.settings, label: "Settings", icon: SettingsIcon },
];

/**
 * iOS-style bottom tab bar, padded for the home indicator.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 bg-background/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-card/80 dark:shadow-none"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-200 active:scale-95",
                  active ? "font-bold text-primary" : "font-medium text-muted-foreground",
                )}
              >
                <Icon
                  className={cn("size-6 transition-transform duration-300", active && "scale-105")}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
