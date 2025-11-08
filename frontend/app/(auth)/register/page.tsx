"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";

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

  const onboardingChecklist = useMemo(
    () => [
      "Invite teammates and set roles",
      "Connect data sources and dashboards",
      "Launch automated ritual timelines",
    ],
    [],
  );

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-muted)_55%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-[0.32em] text-[var(--color-muted-foreground)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Create account
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Build your intelligence hub
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-muted-foreground)_86%,transparent)]">
            Spin up a secure workspace, invite collaborators, and orchestrate decisions with AI-augmented context.
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-sm font-medium text-[color-mix(in_srgb,var(--color-foreground)_92%,transparent)]"
          >
            Name (optional)
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            leadingIcon={<UserRound className="h-4 w-4" aria-hidden />}
            {...register("name", {})}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[color-mix(in_srgb,var(--color-foreground)_92%,transparent)]"
          >
            Work email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@insightiq.com"
            leadingIcon={<Mail className="h-4 w-4" aria-hidden />}
            {...register("email", {
              required: "Email is required",
            })}
          />
          {errors.email?.message && (
            <p className="text-xs text-[var(--color-danger,#e11d48)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[color-mix(in_srgb,var(--color-foreground)_92%,transparent)]"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            leadingIcon={<Lock className="h-4 w-4" aria-hidden />}
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
        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-[color-mix(in_srgb,var(--color-foreground)_92%,transparent)]"
          >
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            leadingIcon={<Lock className="h-4 w-4" aria-hidden />}
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
          />
          {errors.confirmPassword?.message && (
            <p className="text-xs text-[var(--color-danger,#e11d48)]">{errors.confirmPassword.message}</p>
          )}
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-danger,#e11d48)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-danger,#e11d48)_12%,transparent)] px-3 py-2 text-sm text-[var(--color-danger,#e11d48)]">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-danger,#e11d48)]" />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {isSubmitting ? "Creating your workspace" : "Launch InsightIQ"}
        </Button>
      </form>

      <div className="space-y-6">
        <p className="text-sm text-[color-mix(in_srgb,var(--color-muted-foreground)_90%,transparent)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]"
          >
            Sign in instead
          </Link>
        </p>
        <div className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-muted)_45%,transparent)] p-4 text-sm text-[color-mix(in_srgb,var(--color-muted-foreground)_82%,transparent)]">
          <p className="font-medium text-[var(--color-foreground)]">Day 1 onboarding</p>
          <ul className="mt-3 grid gap-2">
            {onboardingChecklist.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
