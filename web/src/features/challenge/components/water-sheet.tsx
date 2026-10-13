"use client";

import { MinusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { errorMessage } from "@/lib/api";
import { useUpdateDay } from "../queries";
import { OUNCES_PER_GALLON, type ChallengeDay } from "../stats";
import { ProgressRing } from "./progress-ring";

const amounts = [8, 16, 24, 32];

type WaterSheetProps = {
  day: ChallengeDay;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Log water through the day. Reaching 128 oz checks off the gallon.
 */
export function WaterSheet({ day, open, onOpenChange }: WaterSheetProps) {
  const updateDay = useUpdateDay();
  const ounces = day.log?.water_oz ?? 0;
  const left = Math.max(OUNCES_PER_GALLON - ounces, 0);

  const setOunces = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), 1000);
    if (clamped >= OUNCES_PER_GALLON && ounces < OUNCES_PER_GALLON) {
      navigator.vibrate?.(12);
      toast.success("A full gallon. Water’s done for today.");
    }
    updateDay.mutate(
      { date: day.date, water_oz: clamped },
      { onError: (error) => toast.error(errorMessage(error, "That didn’t save. Try again.")) },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Water" description="One gallon is 128 oz.">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-card p-6 in-[.dark_[data-sheet]]:bg-muted">
        <ProgressRing value={ounces / OUNCES_PER_GALLON} size={184} stroke={16} label={`${ounces} of 128 ounces`}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-5xl font-extrabold tracking-tight tabular-nums">{ounces}</span>
            <span className="mt-1.5 text-[15px] font-semibold text-muted-foreground">of 128 oz</span>
          </span>
        </ProgressRing>
        <p key={left === 0 ? "done" : "left"} className="mt-2 animate-rise text-[17px] font-bold">
          {left === 0 ? "Gallon done" : `${left} oz to go`}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {amounts.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            className="h-16 flex-col gap-0 rounded-2xl text-lg font-extrabold"
            onClick={() => setOunces(ounces + amount)}
          >
            +{amount}
            <span className="text-xs font-semibold opacity-80">oz</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="lg"
          className="in-[.dark_[data-sheet]]:bg-muted"
          disabled={ounces === 0}
          onClick={() => setOunces(ounces - 8)}
        >
          <MinusIcon /> 8 oz
        </Button>
        <Button size="lg" disabled={left === 0} onClick={() => setOunces(OUNCES_PER_GALLON)}>
          Fill the gallon
        </Button>
      </div>
    </Sheet>
  );
}
