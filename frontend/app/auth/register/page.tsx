"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useUser } from "@/app/providers";
import type { AuthenticatedUser } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@/lib/use-form";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { refresh, setUser } = useUser();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);

    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name || undefined,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        const message = error?.error ?? "Unable to create your account. Please try again.";

        if (response.status === 400) {
          setError("email", { message });
        } else {
          setFormError(message);
        }
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | { user?: AuthenticatedUser }
        | null;

      if (data?.user) {
        setUser(data.user);
      }

      await refresh();
      router.replace("/");
    } catch (error) {
      console.error("Registration failed", error);
      setFormError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Create your account
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Start collaborating with your team in InsightIQ.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1 text-left">
          <label htmlFor="name" className="text-sm font-medium text-[var(--color-foreground)]">
            Name (optional)
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            {...register("name", {})}
          />
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="email" className="text-sm font-medium text-[var(--color-foreground)]">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required",
            })}
          />
          {errors.email?.message && (
            <p className="text-xs text-[var(--color-danger,#e11d48)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <label htmlFor="password" className="text-sm font-medium text-[var(--color-foreground)]">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password?.message && (
            <p className="text-xs text-[var(--color-danger,#e11d48)]">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1 text-left">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-foreground)]">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
          />
          {errors.confirmPassword?.message && (
            <p className="text-xs text-[var(--color-danger,#e11d48)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        {formError && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-danger,#e11d48) 8%,transparent)] px-3 py-2 text-sm text-[var(--color-danger,#e11d48)]">
            {formError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        Already have an account? {" "}
        <Link
          href="/auth/login"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
