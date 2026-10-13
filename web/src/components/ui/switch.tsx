"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

/**
 * iOS-style toggle.
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full bg-track p-0.5 transition-colors duration-300 ease-(--ease-out-soft) outline-none focus-visible:ring-3 focus-visible:ring-primary/40 data-checked:bg-primary data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-300 ease-(--ease-spring) data-checked:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
