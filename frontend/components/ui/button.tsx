"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-foreground,#ffffff)] shadow-[var(--shadow-soft)] hover:bg-[var(--color-accent-emphasis)]",
  secondary:
    "bg-[var(--color-accent-soft)] text-[var(--color-foreground)] hover:bg-[color-mix(in srgb,var(--color-accent-soft) 70%,var(--color-accent) 30%)]",
  outline:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-strong)]",
  ghost:
    "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs font-medium",
  md: "h-10 px-4 text-sm font-medium",
  lg: "h-12 px-5 text-base font-semibold",
  icon: "h-10 w-10",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    size === "icon" && "p-0",
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon,
      children,
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent-foreground,#ffffff)] border-r-transparent" />
        )}
        {icon}
        <span className={cn(size === "icon" && "sr-only")}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
