"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { errorMessage } from "@/lib/api";
import { useUpdateDay } from "../queries";
import { PAGES_PER_DAY, type ChallengeDay } from "../stats";

type ReadingSheetProps = {
  day: ChallengeDay;
  /** The book to suggest when nothing is logged yet. */
  suggestedTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Log what you read: the book and how many pages. Saving checks off reading.
 */
export function ReadingSheet({ day, suggestedTitle, open, onOpenChange }: ReadingSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Reading" description="Ten pages minimum. Nonfiction only.">
      {/* Remount on open so the form starts from what's saved. */}
      {open && <ReadingForm day={day} suggestedTitle={suggestedTitle} onSaved={() => onOpenChange(false)} />}
    </Sheet>
  );
}

function ReadingForm({
  day,
  suggestedTitle,
  onSaved,
}: {
  day: ChallengeDay;
  suggestedTitle: string | null;
  onSaved: () => void;
}) {
  const updateDay = useUpdateDay();
  const [title, setTitle] = useState(day.log?.book_title ?? suggestedTitle ?? "");
  const [pages, setPages] = useState(day.log?.pages ?? PAGES_PER_DAY);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateDay.mutate(
      { date: day.date, pages, book_title: title.trim() || null },
      { onError: (error) => toast.error(errorMessage(error, "That didn’t save. Try again.")) },
    );
    onSaved();
  };

  const step = (delta: number) => setPages((current) => Math.min(Math.max(current + delta, 1), 2000));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="book-title" className="px-1">
          Book
        </Label>
        <Input
          id="book-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What are you reading?"
          autoComplete="off"
          maxLength={255}
          className="bg-card in-[.dark_[data-sheet]]:bg-muted"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="px-1 text-[15px] font-semibold">Pages read</span>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-2 in-[.dark_[data-sheet]]:bg-muted">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-xl"
            onClick={() => step(-1)}
            aria-label="One page fewer"
          >
            <MinusIcon className="size-5" />
          </Button>
          <span className="flex flex-col items-center leading-none">
            <span key={pages} className="animate-pop text-4xl font-extrabold tabular-nums">
              {pages}
            </span>
            <span className="mt-1 text-sm font-semibold text-muted-foreground">{pages === 1 ? "page" : "pages"}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-xl"
            onClick={() => step(1)}
            aria-label="One more page"
          >
            <PlusIcon className="size-5" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 30, 50].map((count) => (
            <Button
              key={count}
              type="button"
              variant={pages === count ? "default" : "secondary"}
              className={pages === count ? "" : "bg-card in-[.dark_[data-sheet]]:bg-muted"}
              onClick={() => setPages(count)}
            >
              {count}
            </Button>
          ))}
        </div>
        {pages < PAGES_PER_DAY && (
          <p className="px-1 text-sm font-semibold text-destructive">75 Hard needs at least 10 pages.</p>
        )}
      </div>

      <SubmitButton size="lg" className="w-full">
        Save reading
      </SubmitButton>
    </form>
  );
}
