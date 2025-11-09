"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface InsightChartProps {
  chartConfig?: Record<string, unknown> | null;
  sampleRows: Array<Record<string, unknown>>;
}

interface HistogramBin {
  label: string;
  count: number;
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

function formatRange(start: number, end: number) {
  const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function histogramData(field: string, rows: Array<Record<string, unknown>>): HistogramBin[] {
  const values = rows
    .map((row) => toNumber(row[field]))
    .filter((value): value is number => value != null);

  if (values.length < 2) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [];
  }

  const binCount = Math.min(12, Math.max(4, Math.ceil(Math.sqrt(values.length))));
  const binSize = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize;
    const end = index === binCount - 1 ? max : start + binSize;
    return { label: formatRange(start, end), start, end, count: 0 };
  });

  values.forEach((value) => {
    const index = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[index].count += 1;
  });

  return bins.map((bin) => ({ label: bin.label, count: bin.count }));
}

function categoricalCounts(field: string, rows: Array<Record<string, unknown>>) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const value = row[field];
    const label = value == null || value === "" ? "Missing" : String(value);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ category: label, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
}

function scatterData(xKey: string, yKey: string, rows: Array<Record<string, unknown>>) {
  return rows
    .map((row) => {
      const x = toNumber(row[xKey]);
      const y = toNumber(row[yKey]);
      if (x == null || y == null) {
        return null;
      }
      return { x, y };
    })
    .filter((point): point is { x: number; y: number } => point != null);
}

export function InsightChart({ chartConfig, sampleRows }: InsightChartProps) {
  const chart = useMemo(() => {
    if (!chartConfig || typeof chartConfig.type !== "string") {
      return { element: null, message: "No chart configuration available." };
    }

    const type = chartConfig.type.toLowerCase();

    if (type === "histogram") {
      const field = typeof chartConfig.x === "string" ? chartConfig.x : undefined;
      if (!field) {
        return { element: null, message: "Histogram configuration is incomplete." };
      }

      const bins = histogramData(field, sampleRows);
      if (bins.length === 0) {
        return { element: null, message: "Not enough numerical data to plot a histogram." };
      }

      return {
        element: (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-20} textAnchor="end" height={70} tick={{ fill: "var(--color-muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  cursor={{ fill: "color-mix(in srgb,var(--color-accent-soft) 40%,transparent)" }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      };
    }

    if (type === "bar") {
      const field = typeof chartConfig.x === "string" ? chartConfig.x : undefined;
      const valueKey = typeof chartConfig.y === "string" ? chartConfig.y : "count";
      if (!field) {
        return { element: null, message: "Bar chart configuration is incomplete." };
      }

      if (valueKey === "count") {
        const data = categoricalCounts(field, sampleRows);
        if (data.length === 0) {
          return { element: null, message: "Not enough categorical data to plot a distribution." };
        }

        return {
          element: (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fill: "var(--color-muted-foreground)" }} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                  <Tooltip
                    cursor={{ fill: "color-mix(in srgb,var(--color-accent-soft) 40%,transparent)" }}
                    contentStyle={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-md)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ),
        };
      }

      const data = sampleRows
        .map((row) => {
          const category = row[field];
          const value = toNumber(row[valueKey]);
          if (category == null || value == null) {
            return null;
          }
          return { category: String(category), value };
        })
        .filter((item): item is { category: string; value: number } => item != null);

      if (data.length === 0) {
        return { element: null, message: "Not enough data to plot the requested chart." };
      }

      return {
        element: (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fill: "var(--color-muted-foreground)" }} interval={0} angle={-20} textAnchor="end" height={70} />
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
                <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      };
    }

    if (type === "scatter") {
      const xKey = typeof chartConfig.x === "string" ? chartConfig.x : undefined;
      const yKey = typeof chartConfig.y === "string" ? chartConfig.y : undefined;
      if (!xKey || !yKey) {
        return { element: null, message: "Scatter plot configuration is incomplete." };
      }

      const points = scatterData(xKey, yKey, sampleRows);
      if (points.length === 0) {
        return { element: null, message: "Not enough numerical data to plot a scatter chart." };
      }

      return {
        element: (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name={xKey} tick={{ fill: "var(--color-muted-foreground)" }} />
                <YAxis type="number" dataKey="y" name={yKey} tick={{ fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  cursor={{ stroke: "var(--color-accent)", strokeWidth: 2 }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Scatter data={points} fill="var(--color-accent)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ),
      };
    }

    return { element: null, message: `Chart type "${chartConfig.type}" is not supported.` };
  }, [chartConfig, sampleRows]);

  if (chart.element) {
    return chart.element;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-4 text-sm text-[var(--color-muted-foreground)]">
      {chart.message}
    </div>
  );
}
