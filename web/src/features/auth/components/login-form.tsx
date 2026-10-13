"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/forms/form-error";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/forms";
import { routes } from "@/lib/routes";
import { useLogin } from "../queries";
import { loginSchema, type LoginInput } from "../schemas";

export function LoginForm() {
  const login = useLogin();
  const form = useForm<z.input<typeof loginSchema>, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "", remember: true },
  });

  // On success the `me` cache updates and <AuthGuard> redirects.
  const onSubmit = form.handleSubmit((values) =>
    login.mutateAsync(values).catch((error) => {
      form.resetField("password", { keepError: false });
      applyServerErrors(form, error);
    }),
  );

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in with your email or username."
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link href={routes.register} className="font-bold text-primary">
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <FormError message={form.formState.errors.root?.server?.message} />
          <TextField
            control={form.control}
            name="login"
            label="Email or username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
          />
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            labelAction={
              <Link
                href={routes.forgotPassword}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            }
          />
          <label className="flex items-center gap-2.5 text-[15px] font-medium">
            <input type="checkbox" className="size-5 accent-primary" {...form.register("remember")} />
            Keep me signed in
          </label>
          <SubmitButton pending={form.formState.isSubmitting} className="w-full" size="lg">
            Sign in
          </SubmitButton>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
