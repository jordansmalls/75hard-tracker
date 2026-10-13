import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
};

/**
 * An iOS-style large title. The subtitle sits underneath and is set lighter.
 */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex animate-rise items-end justify-between gap-4 pt-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-[34px] leading-tight font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-[17px] font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
