"use client";

import { Drawer } from "@base-ui/react/drawer";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

/**
 * An iOS-style bottom sheet with a grabber and a Done button. Swipe down to dismiss.
 * Content inside can tell it's in a sheet with `in-[[data-sheet]]:`.
 */
export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-(--ease-sheet) data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute dark:opacity-[calc(0.6*(1-var(--drawer-swipe-progress)))]" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
            <Drawer.Popup
              data-sheet
              className="-mb-12 max-h-[calc(92dvh+3rem)] w-full max-w-md [transform:translateY(var(--drawer-swipe-movement-y))] overflow-y-auto overscroll-contain rounded-t-[28px] bg-background px-4 pt-2.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+3rem)] text-foreground shadow-[0_-12px_40px_rgb(0_0_0/0.18)] transition-transform duration-[450ms] ease-(--ease-sheet) outline-none data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-swiping:select-none dark:bg-card"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-track" />
              <Drawer.Content className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4 px-1">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Drawer.Title className="text-[28px] leading-tight font-extrabold tracking-tight">{title}</Drawer.Title>
                    {description && (
                      <Drawer.Description className="text-[15px] font-medium text-muted-foreground">
                        {description}
                      </Drawer.Description>
                    )}
                  </div>
                  <Drawer.Close render={<Button variant="outline" size="sm" className="h-9 shrink-0 rounded-full px-4" />}>
                    Done
                  </Drawer.Close>
                </div>
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}
