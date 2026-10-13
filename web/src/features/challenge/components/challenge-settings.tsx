"use client";

import { SettingsSection } from "@/components/settings-section";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "../dates";
import { useChallenge } from "../queries";
import { RestartDialog } from "./restart-dialog";

export function ChallengeSettings({ style }: { style?: React.CSSProperties }) {
  const { data: challenge, isPending } = useChallenge();

  return (
    <SettingsSection title="Challenge" style={style}>
      {isPending ? (
        <Spinner className="mx-auto size-5 text-muted-foreground" />
      ) : !challenge ? (
        <p className="text-[15px] font-normal text-muted-foreground">You haven’t started a challenge yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3">
            <Row
              label="Day 1"
              value={formatDate(challenge.started_on, { weekday: "short", month: "long", day: "numeric" })}
            />
            <Row
              label="Day 75"
              value={formatDate(challenge.ends_on, { weekday: "short", month: "long", day: "numeric" })}
            />
            <Row label="Attempt" value={`#${challenge.attempt}`} />
            <Row label="Time zone" value={challenge.timezone.replaceAll("_", " ")} />
          </dl>
          <RestartDialog
            trigger={
              <Button variant="destructive" size="lg" className="w-full">
                Restart from Day 1
              </Button>
            }
          />
        </div>
      )}
    </SettingsSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-base font-medium text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold">{value}</dd>
    </div>
  );
}
