"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface DatasetListItem {
  id: string;
  name: string;
  description?: string | null;
  row_count: number;
  column_count: number;
  created_at: string;
}

interface DatasetResponse {
  id: string;
  name: string;
  description?: string | null;
  row_count: number;
  columns: Array<Record<string, unknown>>;
  created_at: string;
}

type ToastVariant = "success" | "error";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

function formatDate(input: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(input));
  } catch (error) {
    console.error("Failed to format date", error);
    return input;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<DatasetListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef<Map<number, number>>(new Map());

  const dismissToast = useCallback((id: number) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...toast, id }]);
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
        toastTimers.current.delete(id);
      }, 4200);
      toastTimers.current.set(id, timer);
    },
    [],
  );

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const mapDatasetResponse = useCallback((dataset: DatasetResponse): DatasetListItem => ({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    row_count: dataset.row_count,
    column_count: dataset.columns?.length ?? 0,
    created_at: dataset.created_at,
  }), []);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/datasets", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load datasets");
      }

      const data = (await response.json()) as DatasetListItem[];
      setDatasets(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDatasets();
  }, [fetchDatasets]);

  const handleUploadSuccess = useCallback(
    (dataset: DatasetResponse) => {
      const mapped = mapDatasetResponse(dataset);
      setDatasets((prev) => [mapped, ...prev]);
      showToast({
        variant: "success",
        title: "Dataset uploaded",
        description: `${dataset.name} is ready to explore.`,
      });
    },
    [mapDatasetResponse, showToast],
  );

  const handleUploadError = useCallback(
    (message: string) => {
      showToast({
        variant: "error",
        title: "Upload failed",
        description: message,
      });
    },
    [showToast],
  );

  const handleDeleteDataset = useCallback(
    async (dataset: DatasetListItem) => {
      setConfirmingDelete(dataset);
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!confirmingDelete) return;

    const dataset = confirmingDelete;
    setConfirmingDelete(null);
    setDeletingId(dataset.id);
    setDatasets((prev) => prev.filter((item) => item.id !== dataset.id));

    try {
      const response = await fetch(`/api/v1/datasets/${dataset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete dataset");
      }

      showToast({
        variant: "success",
        title: "Dataset deleted",
        description: `${dataset.name} has been removed.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        variant: "error",
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Unable to delete dataset.",
      });
      await fetchDatasets();
    } finally {
      setDeletingId(null);
    }
  }, [confirmingDelete, fetchDatasets, showToast]);

  const cancelDelete = useCallback(() => {
    setConfirmingDelete(null);
  }, []);

  const datasetSummary = useMemo(() => {
    if (datasets.length === 0) {
      return "Get started by uploading your first dataset.";
    }

    const totalRows = datasets.reduce((acc, item) => acc + item.row_count, 0);
    const totalColumns = datasets.reduce((acc, item) => acc + item.column_count, 0);
    return `${datasets.length} dataset${datasets.length > 1 ? "s" : ""} • ${formatNumber(totalRows)} rows • ${formatNumber(totalColumns)} columns`;
  }, [datasets]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Datasets</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">{datasetSummary}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCcw className="h-4 w-4" />}
            onClick={() => void fetchDatasets()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setUploadOpen(true)}
          >
            Upload dataset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your datasets</CardTitle>
          <CardDescription>
            Upload CSV files to explore and generate insights in InsightIQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center">
              <p className="text-sm font-medium text-[var(--color-foreground)]">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void fetchDatasets()}>
                Try again
              </Button>
            </div>
          ) : null}

          {!error && loading ? (
            <div className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading datasets…
            </div>
          ) : null}

          {!error && !loading && datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-10 text-center">
              <FileText className="h-8 w-8 text-[var(--color-muted-foreground)]" aria-hidden />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--color-foreground)]">No datasets yet</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Upload a CSV file to start exploring your data with InsightIQ.
                </p>
              </div>
              <Button icon={<Upload className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
                Upload your first dataset
              </Button>
            </div>
          ) : null}

          {!error && datasets.length > 0 ? (
            <DataTableContainer>
              <DataTableHeader>
                <tr>
                  <DataTableHead>Name</DataTableHead>
                  <DataTableHead>Description</DataTableHead>
                  <DataTableHead>Rows</DataTableHead>
                  <DataTableHead>Columns</DataTableHead>
                  <DataTableHead>Uploaded</DataTableHead>
                  <DataTableHead className="w-32 text-right">Actions</DataTableHead>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {datasets.map((dataset) => (
                  <DataTableRow key={dataset.id}>
                    <DataTableCell>
                      <Link
                        href={`/datasets/${dataset.id}`}
                        className="font-medium text-[var(--color-foreground)] hover:text-[var(--color-accent)]"
                      >
                        {dataset.name}
                      </Link>
                    </DataTableCell>
                    <DataTableCell className="max-w-xs text-sm text-[var(--color-muted-foreground)]">
                      {dataset.description ?? "—"}
                    </DataTableCell>
                    <DataTableCell>{formatNumber(dataset.row_count)}</DataTableCell>
                    <DataTableCell>{formatNumber(dataset.column_count)}</DataTableCell>
                    <DataTableCell>{formatDate(dataset.created_at)}</DataTableCell>
                    <DataTableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/datasets/${dataset.id}`}
                          className={cn(
                            buttonStyles({ variant: "ghost", size: "sm" }),
                            "inline-flex items-center gap-1",
                          )}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-danger)] hover:text-[var(--color-danger)]"
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => handleDeleteDataset(dataset)}
                          disabled={deletingId === dataset.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTableContainer>
          ) : null}
        </CardContent>
      </Card>

      {uploadOpen ? (
        <UploadDatasetDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />
      ) : null}

      {confirmingDelete ? (
        <ConfirmDeleteDialog
          dataset={confirmingDelete}
          onCancel={cancelDelete}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

interface UploadDatasetDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (dataset: DatasetResponse) => void;
  onError: (message: string) => void;
}

function UploadDatasetDialog({ open, onClose, onSuccess, onError }: UploadDatasetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setFile(null);
      setFormError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!file) {
        setFormError("Please choose a CSV file to upload.");
        return;
      }

      if (!name.trim()) {
        setFormError("Name is required.");
        return;
      }

      setSubmitting(true);
      setFormError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        if (description.trim()) {
          formData.append("description", description);
        }

        const response = await fetch("/api/v1/datasets", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to upload dataset");
        }

        const data = (await response.json()) as DatasetResponse;
        onSuccess(data);
        onClose();
      } catch (error) {
        console.error(error);
        onError(error instanceof Error ? error.message : "Unable to upload dataset.");
      } finally {
        setSubmitting(false);
      }
    },
    [description, file, name, onClose, onError, onSuccess],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Upload dataset</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Upload a CSV file and give it a friendly name for easy discovery.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-[var(--color-muted-foreground)] transition hover:bg-[var(--color-surface-muted)]"
            onClick={onClose}
            aria-label="Close upload dialog"
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]" htmlFor="dataset-name">
              Name
            </label>
            <input
              id="dataset-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Customer subscriptions"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]" htmlFor="dataset-description">
              Description
            </label>
            <textarea
              id="dataset-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context for your teammates"
              rows={3}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-foreground)]" htmlFor="dataset-file">
              CSV file
            </label>
            <input
              id="dataset-file"
              type="file"
              accept=".csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[var(--color-foreground)]"
            />
          </div>

          {formError ? (
            <p className="text-sm text-[var(--color-danger)]">{formError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" icon={<Upload className="h-4 w-4" />} loading={submitting}>
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmDeleteDialogProps {
  dataset: DatasetListItem;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteDialog({ dataset, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Delete dataset</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              This will permanently remove <span className="font-semibold">{dataset.name}</span> and delete the underlying table.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-[var(--color-muted-foreground)] transition hover:bg-[var(--color-surface-muted)]"
            onClick={onCancel}
            aria-label="Close delete dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-4 text-sm">
          <p>
            <span className="font-medium text-[var(--color-foreground)]">Rows:</span> {formatNumber(dataset.row_count)}
          </p>
          <p>
            <span className="font-medium text-[var(--color-foreground)]">Columns:</span> {formatNumber(dataset.column_count)}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-[var(--color-danger)] hover:bg-[color-mix(in srgb,var(--color-danger) 85%, black 15%)]"
            onClick={onConfirm}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete dataset
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-[var(--radius-md)] border p-4 shadow-lg",
            toast.variant === "success"
              ? "border-[color-mix(in srgb,var(--color-success) 85%,transparent)] bg-[color-mix(in srgb,var(--color-success) 18%,white 82%)] text-[var(--color-success)]"
              : "border-[color-mix(in srgb,var(--color-danger) 85%,transparent)] bg-[color-mix(in srgb,var(--color-danger) 18%,white 82%)] text-[var(--color-danger)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-none text-[var(--color-foreground)]">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="text-xs text-[var(--color-muted-foreground)]">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-full p-1 text-[var(--color-muted-foreground)] transition hover:bg-white/40"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
