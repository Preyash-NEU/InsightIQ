"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Play, RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTableBody,
  DataTableCell,
  DataTableContainer,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/ui/data-table";
import { ChartRenderer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface QueryResult {
  query_id: string;
  sql: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  row_count: number;
  execution_time_ms: number;
  chart_suggestion?: Record<string, unknown> | null;
  insight?: string | null;
}

interface QueryHistoryItem {
  id: string;
  dataset_id: string;
  user_id: string;
  nl_question: string;
  generated_sql: string;
  row_count: number;
  execution_time_ms: number | null;
  error: string | null;
  status: string;
  created_at: string;
}

interface QueryHistoryResponse {
  queries: QueryHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

interface QueryWorkspaceProps {
  datasetId: string;
  datasetName: string;
}

function formatDate(value: string) {
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

function formatDuration(value: number | null | undefined) {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(2)} ms`;
}

function normaliseCellValue(value: unknown) {
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

async function postQuery(datasetId: string, question: string, signal?: AbortSignal) {
  const response = await fetch("/api/v1/queries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dataset_id: datasetId, nl_question: question }),
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    let detail = "Failed to run query";
    try {
      const payload = await response.json();
      if (payload?.detail) {
        detail = String(payload.detail);
      }
    } catch (error) {
      console.error("Failed to parse error response", error);
    }
    throw new Error(detail);
  }

  return (await response.json()) as QueryResult;
}

async function fetchHistory(
  datasetId: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<QueryHistoryResponse> {
  const params = new URLSearchParams({
    dataset_id: datasetId,
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(`/api/v1/queries?${params.toString()}`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load query history");
  }

  return (await response.json()) as QueryHistoryResponse;
}

export function QueryWorkspace({ datasetId, datasetName }: QueryWorkspaceProps) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [history, setHistory] = useState<QueryHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<QueryHistoryItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError(null);

    fetchHistory(datasetId, historyPage, historyPageSize, controller.signal)
      .then((payload) => {
        setHistory(payload);
        if (payload.queries.length === 0) {
          setSelectedHistory(null);
        }
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        console.error(error);
        setHistoryError(error instanceof Error ? error.message : "Unable to load query history");
      })
      .finally(() => {
        setHistoryLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [datasetId, historyPage, historyPageSize, historyRefresh]);

  const totalPages = useMemo(() => {
    if (!history) {
      return 1;
    }
    return Math.max(1, Math.ceil(history.total / historyPageSize));
  }, [history, historyPageSize]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>, overrideQuestion?: string) => {
      if (event) {
        event.preventDefault();
      }
      const queryToRun = overrideQuestion ?? question;
      if (!queryToRun.trim()) {
        setSubmitError("Please enter a question to run against this dataset.");
        return;
      }

      const controller = new AbortController();
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = await postQuery(datasetId, queryToRun, controller.signal);
        setResult(payload);
        setQuestion(queryToRun);
        setHistoryPage(1);
        setHistoryRefresh((value) => value + 1);
      } catch (error) {
        console.error(error);
        setSubmitError(error instanceof Error ? error.message : "Failed to run query.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [datasetId, question],
  );

  const handleRerun = useCallback(
    (item: QueryHistoryItem) => {
      setQuestion(item.nl_question);
      void handleSubmit(undefined, item.nl_question);
    },
    [handleSubmit],
  );

  const columns = useMemo(() => result?.columns ?? [], [result?.columns]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <CardDescription>
            Generate insights from <span className="font-semibold text-[var(--color-foreground)]">{datasetName}</span> by
            describing what you would like to explore.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. What is the total number of records for last quarter?"
              rows={5}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                <TriangleAlert className="h-4 w-4" />
                <span>Natural language questions are converted into read-only SQL queries.</span>
              </div>
              <Button type="submit" loading={isSubmitting} icon={<Play className="h-4 w-4" />}>
                Run query
              </Button>
            </div>
          </form>
          {submitError ? (
            <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isSubmitting ? (
        <Card>
          <CardHeader>
            <CardTitle>Running query…</CardTitle>
            <CardDescription>Please wait while we process your request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : null}

      {!isSubmitting && result ? (
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Query results</CardTitle>
              <CardDescription>
                Returned {result.row_count} rows in {formatDuration(result.execution_time_ms)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {columns.length > 0 ? (
                <DataTableContainer>
                  <DataTableHeader>
                    <tr>
                      {columns.map((column) => (
                        <DataTableHead key={column}>{column}</DataTableHead>
                      ))}
                    </tr>
                  </DataTableHeader>
                  <DataTableBody>
                    {result.rows.map((row, index) => (
                      <DataTableRow key={index}>
                        {columns.map((column) => (
                          <DataTableCell key={column}>{normaliseCellValue(row[column])}</DataTableCell>
                        ))}
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </DataTableContainer>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">No tabular data returned.</p>
              )}

              {result.insight ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-foreground)]">
                  <p className="font-semibold">Insight</p>
                  <p className="text-[var(--color-muted-foreground)]">{result.insight}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Generated SQL</p>
                <pre className="max-h-64 overflow-auto rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-4 text-xs text-[var(--color-foreground)]">
                  <code>{result.sql}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <ChartRenderer
            suggestion={result.chart_suggestion}
            rows={result.rows}
            description={result.insight ?? undefined}
            emptyFallback={
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-muted-foreground)]">
                No chart suggestion is available for this result.
              </div>
            }
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[var(--color-muted-foreground)]" />
              <div>
                <CardTitle>Query history</CardTitle>
                <CardDescription>Recently executed questions for this dataset.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : null}

            {historyError ? (
              <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {historyError}
              </div>
            ) : null}

            {!historyLoading && history && history.queries.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No queries have been run for this dataset yet.
              </p>
            ) : null}

            {!historyLoading && history && history.queries.length > 0 ? (
              <div className="space-y-3">
                {history.queries.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{item.nl_question}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">{formatDate(item.created_at)}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Status: {item.status}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RefreshCw className="h-4 w-4" />}
                          onClick={() => handleRerun(item)}
                        >
                          Rerun
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedHistory(item)}>
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {history ? (
              <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                <span>
                  Page {history.page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={historyPage <= 1 || historyLoading}
                    onClick={() => setHistoryPage((value) => Math.max(1, value - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={historyPage >= totalPages || historyLoading}
                    onClick={() => setHistoryPage((value) => Math.min(totalPages, value + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query details</CardTitle>
            <CardDescription>Inspect SQL, runtime, and status for previous executions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedHistory ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{selectedHistory.nl_question}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{formatDate(selectedHistory.created_at)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-[var(--color-muted-foreground)]">
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">Status</p>
                    <p>{selectedHistory.status}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">Rows</p>
                    <p>{selectedHistory.row_count}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">Duration</p>
                    <p>{formatDuration(selectedHistory.execution_time_ms)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">Query ID</p>
                    <p className="break-all">{selectedHistory.id}</p>
                  </div>
                </div>
                {selectedHistory.error ? (
                  <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {selectedHistory.error}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Generated SQL
                  </p>
                  <pre className="max-h-64 overflow-auto rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3 text-[11px] leading-relaxed text-[var(--color-foreground)]">
                    <code>{selectedHistory.generated_sql || "No SQL recorded."}</code>
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Select a query from the history to inspect its details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
