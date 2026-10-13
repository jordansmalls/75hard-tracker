"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/forms/form-error";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/forms";
import { routes } from "@/lib/routes";
import { useForgotPassword } from "../queries";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const form = useForm<z.input<typeof forgotPasswordSchema>, unknown, ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) =>
    forgotPassword.mutateAsync(values).catch((error) => applyServerErrors(form, error)),
  );

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link href={routes.login} className="font-bold text-primary">
          Back to sign in
        </Link>
      }
    >
      {forgotPassword.isSuccess ? (
        <Alert>
          <MailCheckIcon />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>{forgotPassword.data.message}</AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <FormError message={form.formState.errors.root?.server?.message} />
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
            />
            <SubmitButton pending={form.formState.isSubmitting} className="w-full" size="lg">
              Send reset link
            </SubmitButton>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
