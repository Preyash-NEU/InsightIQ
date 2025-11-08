import * as React from "react";
import { cn } from "@/lib/utils";

export type DataTableContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function DataTableContainer({ className, children, ...props }: DataTableContainerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="max-h-[70vh] overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

export function DataTableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[var(--color-border)]", className)} {...props} />;
}

export function DataTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[color-mix(in srgb,var(--color-surface-muted) 75%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-6 py-4 align-middle text-[var(--color-foreground)]", className)}
      {...props}
    />
  );
}

export function DataTableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[color-mix(in srgb,var(--color-muted-foreground) 85%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
