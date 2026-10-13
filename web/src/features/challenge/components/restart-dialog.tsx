"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { errorMessage } from "@/lib/api";
import { todayIn } from "../dates";
import { useStartChallenge } from "../queries";

type RestartDialogProps = {
  /** The button that opens the dialog. */
  trigger: ReactElement;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

/**
 * Confirms, then starts a fresh challenge on Day 1 today.
 */
export function RestartDialog({
  trigger,
  title = "Start over from Day 1?",
  description = "Your current run ends and Day 1 starts today. That’s the rule: miss a day, start again.",
  confirmLabel = "Start over",
}: RestartDialogProps) {
  const start = useStartChallenge();

  const restart = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    start.mutate(
      { started_on: todayIn(timezone), timezone, backfill: false },
      {
        onSuccess: () => toast.success("Day 1. Let’s go."),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={trigger} />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/30 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute dark:bg-black/60" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-3rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-3xl bg-card p-6 text-center shadow-2xl transition-[scale,opacity] duration-300 ease-(--ease-spring) outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-110 data-starting-style:opacity-0">
          <div className="flex flex-col gap-2">
            <AlertDialog.Title className="text-xl font-bold tracking-tight">{title}</AlertDialog.Title>
            <AlertDialog.Description className="text-[15px] font-normal text-muted-foreground">
              {description}
            </AlertDialog.Description>
          </div>
          <div className="flex flex-col gap-2">
            <AlertDialog.Close
              render={<Button size="lg" className="w-full" />}
              onClick={restart}
              disabled={start.isPending}
            >
              {start.isPending && <Spinner />}
              {confirmLabel}
            </AlertDialog.Close>
            <AlertDialog.Close render={<Button size="lg" variant="ghost" className="w-full font-medium" />}>
              Cancel
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
