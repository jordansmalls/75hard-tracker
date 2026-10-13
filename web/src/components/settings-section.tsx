import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * An iOS-style settings group: a bold heading above a rounded card.
 */
export function SettingsSection({ title, description, children, className, style }: SettingsSectionProps) {
  return (
    <section className={cn("flex animate-rise flex-col gap-2", className)} style={style}>
      <div className="flex flex-col gap-0.5 px-1">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-[15px] font-normal text-muted-foreground">{description}</p>}
      </div>
      <div className="rounded-2xl bg-card p-4">{children}</div>
    </section>
  );
}
