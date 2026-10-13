"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/forms/form-error";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/forms";
import { routes } from "@/lib/routes";
import { useResetPassword } from "../queries";
import { PASSWORD_MIN_LENGTH, resetPasswordSchema, type ResetPasswordInput } from "../schemas";

/**
 * Reads `token` and `email` from the link in the reset email. Uses
 * `useSearchParams`, so render it inside a <Suspense> boundary.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const resetPassword = useResetPassword();
  const form = useForm<z.input<typeof resetPasswordSchema>, unknown, ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email, password: "", password_confirmation: "" },
  });

  const onSubmit = form.handleSubmit((values) =>
    resetPassword
      .mutateAsync(values)
      .then(({ message }) => {
        toast.success(message);
        router.replace(routes.login);
      })
      .catch((error) => applyServerErrors(form, error)),
  );

  const backToForgot = (
    <Link href={routes.forgotPassword} className="font-bold text-primary">
      Request a new link
    </Link>
  );

  if (!token || !email) {
    return (
      <AuthCard title="Invalid reset link" description="This password reset link is incomplete." footer={backToForgot}>
        <p className="text-sm text-muted-foreground">Open the link from your email again, or request a new one.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" description={`For ${email}`} footer={backToForgot}>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {/* An expired or invalid token comes back as an `email` error. */}
          <FormError message={form.formState.errors.root?.server?.message ?? form.formState.errors.email?.message} />
          <TextField
            control={form.control}
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            autoFocus
          />
          <TextField
            control={form.control}
            name="password_confirmation"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
          <SubmitButton pending={form.formState.isSubmitting} className="w-full" size="lg">
            Reset password
          </SubmitButton>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
