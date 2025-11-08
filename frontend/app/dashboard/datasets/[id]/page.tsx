import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Columns3,
  Database,
  FileText,
  Layers3,
} from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataTableBody,
  DataTableCell,
  DataTableContainer,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/ui/data-table";

interface DatasetColumn {
  name: string;
  dtype?: string;
  null_count?: number;
  unique_count?: number | null;
  min_value?: unknown;
  max_value?: unknown;
}

interface DatasetDetail {
  id: string;
  name: string;
  description?: string | null;
  table_name: string;
  row_count: number;
  columns: DatasetColumn[];
  original_filename?: string | null;
  file_size_bytes?: number | null;
  created_at: string;
  updated_at: string;
}

interface DatasetPreview {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  total_rows: number;
  showing_rows: number;
}

async function fetchDataset(id: string): Promise<DatasetDetail> {
  const response = await fetch(`/api/v1/datasets/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load dataset");
  }

  return (await response.json()) as DatasetDetail;
}

async function fetchPreview(id: string): Promise<DatasetPreview> {
  const response = await fetch(`/api/v1/datasets/${id}/preview`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load dataset preview");
  }

  return (await response.json()) as DatasetPreview;
}

function formatDate(input: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(input));
  } catch (error) {
    console.error("Failed to format date", error);
    return input;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatFileSize(bytes?: number | null) {
  if (bytes == null || Number.isNaN(bytes)) {
    return "Unknown";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error("Failed to stringify value", error);
      return String(value);
    }
  }

  return String(value);
}

export default async function DatasetDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [dataset, preview] = await Promise.all([
    fetchDataset(id),
    fetchPreview(id),
  ]);

  const columnCount = dataset.columns?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/datasets"
          className={buttonStyles({
            variant: "ghost",
            size: "sm",
            className: "w-fit gap-2 text-[var(--color-muted-foreground)]",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to datasets
        </Link>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {dataset.name}
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {dataset.description || "Dataset metadata and preview"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:text-right">
            <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Rows
              </p>
              <p className="text-base font-semibold text-[var(--color-foreground)]">
                {formatNumber(dataset.row_count)}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Columns
              </p>
              <p className="text-base font-semibold text-[var(--color-foreground)]">
                {formatNumber(columnCount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Dataset details</CardTitle>
              <CardDescription>Key metadata and file information.</CardDescription>
            </div>
            <Database className="h-6 w-6 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Original file</p>
                <p className="text-[var(--color-muted-foreground)]">
                  {dataset.original_filename || "Not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Layers3 className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Storage table</p>
                <p className="text-[var(--color-muted-foreground)]">{dataset.table_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Columns3 className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">File size</p>
                <p className="text-[var(--color-muted-foreground)]">{formatFileSize(dataset.file_size_bytes)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarClock className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Uploaded</p>
                <p className="text-[var(--color-muted-foreground)]">{formatDate(dataset.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarClock className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">Last updated</p>
                <p className="text-[var(--color-muted-foreground)]">{formatDate(dataset.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Columns</CardTitle>
              <CardDescription>Field definitions and statistics.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {columnCount === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">No column metadata available.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {dataset.columns.map((column) => (
                  <div
                    key={column.name}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
                  >
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{column.name}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                      {column.dtype || "Unknown type"}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-muted-foreground)]">
                      <span>Nulls: {formatNumber(column.null_count ?? 0)}</span>
                      <span>
                        Unique: {column.unique_count != null ? formatNumber(column.unique_count) : "—"}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-[var(--color-muted-foreground)]">
                      {column.min_value !== undefined ? (
                        <p>Min: {normalizeValue(column.min_value)}</p>
                      ) : null}
                      {column.max_value !== undefined ? (
                        <p>Max: {normalizeValue(column.max_value)}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Showing {preview.showing_rows} of {preview.total_rows} rows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preview.rows.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-muted-foreground)]">
              The dataset is empty.
            </p>
          ) : (
            <DataTableContainer>
              <DataTableHeader>
                <tr>
                  {preview.columns.map((column) => (
                    <DataTableHead key={column}>{column}</DataTableHead>
                  ))}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {preview.rows.map((row, index) => (
                  <DataTableRow key={index}>
                    {preview.columns.map((column) => (
                      <DataTableCell key={column}>{normalizeValue(row[column])}</DataTableCell>
                    ))}
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
