import { cn } from "@/lib/utils";

type CheckMarkProps = {
  checked: boolean;
  className?: string;
};

/**
 * An empty circle that fills in with a drawn checkmark.
 */
export function CheckMark({ checked, className }: CheckMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-300 ease-(--ease-out-soft)",
        checked
          ? "animate-pop bg-primary shadow-none"
          : "bg-transparent shadow-[inset_0_0_0_2px_var(--track)] in-[.dark_[data-sheet]]:shadow-[inset_0_0_0_2px_#48484a]",
        className,
      )}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="size-[62%] text-primary-foreground" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw"
            style={{ "--path-length": 24 } as React.CSSProperties}
          />
        </svg>
      )}
    </span>
  );
}
