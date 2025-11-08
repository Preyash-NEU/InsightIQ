"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

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

  const footerHighlights = useMemo(
    () => [
      "Enterprise-grade encryption",
      "Role-aware workspace permissions",
      "Zero-config onboarding",
    ],
    [],
  );

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_65%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-muted)_55%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-[0.32em] text-[var(--color-muted-foreground)]">
          <Sparkles className="h-3.5 w-3.5" />
          Sign in
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
            Welcome back, operator
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-muted-foreground)_86%,transparent)]">
            Access command dashboards, automate rituals, and keep every stakeholder aligned in real-time.
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
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

        {formError && (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-danger,#e11d48)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-danger,#e11d48)_12%,transparent)] px-3 py-2 text-sm text-[var(--color-danger,#e11d48)]">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-danger,#e11d48)]" />
            <span>{formError}</span>
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting} icon={<ArrowRight className="h-4 w-4" />}>
          {isSubmitting ? "Signing in" : "Continue to workspace"}
        </Button>
      </form>

      <div className="space-y-6">
        <p className="text-sm text-[color-mix(in_srgb,var(--color-muted-foreground)_90%,transparent)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]"
          >
            Create one in minutes
          </Link>
        </p>
        <ul className="grid gap-3 text-sm text-[color-mix(in_srgb,var(--color-muted-foreground)_82%,transparent)]">
          {footerHighlights.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
