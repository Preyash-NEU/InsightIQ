import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, leadingIcon, trailingIcon, type = "text", ...props },
    ref,
  ) => {
    const hasIcon = leadingIcon || trailingIcon;

    return (
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm transition-colors focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-surface)]",
          className,
        )}
      >
        {leadingIcon && (
          <span className="pl-3 text-[var(--color-muted-foreground)]">{leadingIcon}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-[color-mix(in srgb,var(--color-muted-foreground) 80%,transparent)]",
            hasIcon && "px-0",
          )}
          {...props}
        />
        {trailingIcon && (
          <span className="pr-3 text-[var(--color-muted-foreground)]">{trailingIcon}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
