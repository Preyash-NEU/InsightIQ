import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[color-mix(in srgb,var(--color-muted-foreground) 16%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
