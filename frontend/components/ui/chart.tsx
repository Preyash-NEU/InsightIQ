"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export interface ChartSuggestion {
  type?: string;
  field?: string;
  alias?: string;
  [key: string]: unknown;
}

export interface ChartRendererProps {
  suggestion?: ChartSuggestion | null;
  rows: Array<Record<string, unknown>>;
  title?: string;
  description?: string;
  className?: string;
  emptyFallback?: ReactNode;
}

function formatMetricValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  }

  return String(value ?? "—");
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function ChartRenderer({
  suggestion,
  rows,
  title = "Suggested visualisation",
  description,
  className,
  emptyFallback = null,
}: ChartRendererProps) {
  const effectiveSuggestion = suggestion?.type ? suggestion : null;

  const { chartContent, resolvedTitle, resolvedDescription } = useMemo(() => {
    if (!effectiveSuggestion || rows.length === 0) {
      return { chartContent: emptyFallback, resolvedTitle: title, resolvedDescription: description };
    }

    const valueKey = (effectiveSuggestion.alias as string | undefined) ?? (effectiveSuggestion.field as string | undefined);
    const baseDescription =
      description ??
      (typeof effectiveSuggestion.type === "string"
        ? `Visualised using a ${effectiveSuggestion.type.toLowerCase()} chart.`
        : undefined);

    if (!valueKey) {
      return { chartContent: emptyFallback, resolvedTitle: title, resolvedDescription: baseDescription };
    }

    if (effectiveSuggestion.type === "metric") {
      const value = rows[0]?.[valueKey];
      return {
        chartContent: (
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">{valueKey}</span>
            <span className="text-3xl font-semibold text-[var(--color-foreground)]">
              {formatMetricValue(value)}
            </span>
          </div>
        ),
        resolvedTitle: title,
        resolvedDescription: baseDescription,
      };
    }

    if (effectiveSuggestion.type === "bar") {
      const keys = Object.keys(rows[0] ?? {});
      const categoryKey = keys.find((key) => key !== valueKey) ?? valueKey;

      if (categoryKey === valueKey) {
        const value = rows[0]?.[valueKey];
        return {
          chartContent: (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">{valueKey}</span>
              <span className="text-3xl font-semibold text-[var(--color-foreground)]">
                {formatMetricValue(value)}
              </span>
            </div>
          ),
          resolvedTitle: title,
          resolvedDescription: baseDescription,
        };
      }

      const data = rows
        .map((row, index) => {
          const value = toNumber(row[valueKey]);
          if (value == null) {
            return null;
          }
          return {
            category: (row[categoryKey] as string | number | null) ?? `Row ${index + 1}`,
            value,
          };
        })
        .filter((item): item is { category: string | number; value: number } => item != null);

      if (data.length === 0) {
        return { chartContent: emptyFallback, resolvedTitle: title, resolvedDescription: baseDescription };
      }

      return {
        chartContent: (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  cursor={{ fill: "color-mix(in srgb,var(--color-accent-soft) 40%,transparent)" }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-accent)" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
        resolvedTitle: title,
        resolvedDescription: baseDescription ?? `Displaying ${valueKey} grouped by ${categoryKey}.`,
      };
    }

    return { chartContent: emptyFallback, resolvedTitle: title, resolvedDescription: description };
  }, [effectiveSuggestion, rows, emptyFallback, title, description]);

  if (!chartContent) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{resolvedTitle}</CardTitle>
        {resolvedDescription ? <CardDescription>{resolvedDescription}</CardDescription> : null}
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
