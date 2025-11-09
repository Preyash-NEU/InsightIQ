"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useUser } from "@/app/providers";
import type { AuthenticatedUser } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@/lib/use-form";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { refresh, setUser } = useUser();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        const message = error?.error ?? "Unable to sign in. Please try again.";

        if (response.status === 401) {
          setError("password", { message });
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
      console.error("Login failed", error);
      setFormError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Sign in to continue to your InsightIQ workspace.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
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

        {formError && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-danger,#e11d48) 8%,transparent)] px-3 py-2 text-sm text-[var(--color-danger,#e11d48)]">
            {formError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        Don&apos;t have an account? {" "}
        <Link
          href="/auth/register"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
