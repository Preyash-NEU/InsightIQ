"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface DatasetDetailResponse {
  id: string;
  name: string;
  description?: string | null;
  row_count: number;
  column_count: number;
  created_at: string;
  updated_at?: string;
  columns?: Array<Record<string, unknown>>;
}

interface DatasetDetailViewProps {
  datasetId: string;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    console.error("Failed to format date", error);
    return value;
  }
}

export function DatasetDetailView({ datasetId }: DatasetDetailViewProps) {
  const [dataset, setDataset] = useState<DatasetDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDataset = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/datasets/${datasetId}`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? "Dataset not found" : "Failed to load dataset");
      }

      const data = (await response.json()) as DatasetDetailResponse;
      setDataset(data);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to load dataset";
      setError(message);
      toast({
        variant: "error",
        title: "Unable to load dataset",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [datasetId, toast]);

  useEffect(() => {
    void fetchDataset();
  }, [fetchDataset]);

  const datasetSummary = useMemo(() => {
    if (!dataset) return "";
    return `${formatNumber(dataset.row_count)} rows • ${formatNumber(dataset.column_count)} columns`;
  }, [dataset]);

  const columnPreview = useMemo(() => {
    if (!dataset?.columns || dataset.columns.length === 0) {
      return null;
    }

    return dataset.columns.slice(0, 5).map((column, index) => {
      const name = typeof column.name === "string" ? column.name : `Column ${index + 1}`;
      const type = typeof column.type === "string" ? column.type : undefined;
      return {
        id: `${name}-${index}`,
        name,
        type,
      };
    });
  }, [dataset]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard/datasets"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to datasets
          </Link>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : dataset ? (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">{dataset.name}</h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {dataset.description?.trim() || "Connected dataset ready for analysis."}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Dataset unavailable</h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                We couldn&apos;t find details for this dataset. It may have been removed.
              </p>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCcw className="h-4 w-4" />}
          onClick={() => void fetchDataset()}
          disabled={loading}
          aria-busy={loading}
        >
          Refresh
        </Button>
      </div>

      {error && !loading ? (
        <Card className="border border-dashed border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => void fetchDataset()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <DatasetDetailSkeleton />
      ) : dataset ? (
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Dataset summary</CardTitle>
              <CardDescription>{datasetSummary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[var(--color-foreground)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Rows</p>
                  <p className="text-lg font-semibold">{formatNumber(dataset.row_count)}</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3">
                  <p className="text-xs text-[var(--color-muted-foreground)]">Columns</p>
                  <p className="text-lg font-semibold">{formatNumber(dataset.column_count)}</p>
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-muted-foreground)]">Last updated</p>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  {dataset.updated_at ? formatDateTime(dataset.updated_at) : formatDateTime(dataset.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Column preview</CardTitle>
              <CardDescription>
                {columnPreview ? "First few columns from the uploaded dataset." : "Columns will appear once profiling completes."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {columnPreview ? (
                <ul className="space-y-3 text-sm">
                  {columnPreview.map((column) => (
                    <li
                      key={column.id}
                      className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2"
                    >
                      <span className="font-medium text-[var(--color-foreground)]">{column.name}</span>
                      {column.type ? (
                        <span className="rounded-full bg-[var(--color-surface-strong)] px-2 py-0.5 text-xs text-[var(--color-muted-foreground)]">
                          {column.type}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Connect a data source or run profiling to explore column-level insights.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function DatasetDetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
