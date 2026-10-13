"use client";

import { MailIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useResendVerificationEmail, useUser } from "@/features/auth/queries";
import { errorMessage } from "@/lib/api";

export function EmailVerificationBanner() {
  const user = useUser();
  const resend = useResendVerificationEmail();

  if (user.email_verified_at) return null;

  const onResend = () =>
    resend.mutate(undefined, {
      onSuccess: ({ message }) => toast.success(message),
      onError: (error) => toast.error(errorMessage(error)),
    });

  return (
    <div className="mt-3 flex animate-rise items-start gap-3 rounded-2xl bg-amber-100/70 p-4 text-amber-950 dark:bg-amber-400/15 dark:text-amber-100">
      <MailIcon className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1 text-[15px]">
        <span className="font-semibold">Verify your email</span>
        <span className="font-normal">
          We sent a link to <span className="font-semibold break-all">{user.email}</span>.
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-0 font-bold text-current"
          onClick={onResend}
          disabled={resend.isPending || resend.isSuccess}
        >
          {resend.isSuccess ? "Sent" : "Resend email"}
        </Button>
      </div>
    </div>
  );
}
