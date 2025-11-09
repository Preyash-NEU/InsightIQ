"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Filter, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { InsightChart } from "./insight-chart";

interface RawInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  chart_config?: Record<string, unknown> | null;
  confidence?: number | string | null;
  created_at: string;
}

interface Insight extends Omit<RawInsight, "confidence"> {
  confidence: number | null;
}

interface DatasetPreviewResponse {
  rows: Array<Record<string, unknown>>;
}

interface DatasetInsightsViewProps {
  datasetId: string;
  datasetName: string;
}

type ConfidenceFilter = "all" | "high" | "medium" | "low" | "unknown";
type SortOption = "confidence-desc" | "confidence-asc" | "newest" | "oldest";

function parseConfidence(value: RawInsight["confidence"]): number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchInsights(datasetId: string, signal?: AbortSignal): Promise<Insight[]> {
  const response = await fetch(`/api/v1/insights/${datasetId}`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load insights");
  }

  const payload = (await response.json()) as RawInsight[];
  return payload.map((item) => ({
    ...item,
    confidence: parseConfidence(item.confidence),
  }));
}

async function fetchPreviewRows(datasetId: string, signal?: AbortSignal) {
  const response = await fetch(`/api/v1/datasets/${datasetId}/preview`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load preview data");
  }

  const payload = (await response.json()) as DatasetPreviewResponse;
  return payload.rows ?? [];
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

function confidenceLabel(value: number | null) {
  if (value == null) {
    return { label: "Not available", tone: "neutral" as const };
  }

  if (value >= 0.75) {
    return { label: `${Math.round(value * 100)}% • High`, tone: "high" as const };
  }

  if (value >= 0.5) {
    return { label: `${Math.round(value * 100)}% • Medium`, tone: "medium" as const };
  }

  return { label: `${Math.round(value * 100)}% • Low`, tone: "low" as const };
}

function toneClassName(tone: ReturnType<typeof confidenceLabel>["tone"]) {
  switch (tone) {
    case "high":
      return "bg-emerald-100/70 text-emerald-700 ring-emerald-400/60";
    case "medium":
      return "bg-amber-100/80 text-amber-700 ring-amber-400/60";
    case "low":
      return "bg-rose-100/70 text-rose-700 ring-rose-400/50";
    default:
      return "bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] ring-transparent";
  }
}

function matchesConfidence(filter: ConfidenceFilter, confidence: number | null) {
  switch (filter) {
    case "high":
      return confidence != null && confidence >= 0.75;
    case "medium":
      return confidence != null && confidence >= 0.5 && confidence < 0.75;
    case "low":
      return confidence != null && confidence < 0.5;
    case "unknown":
      return confidence == null;
    default:
      return true;
  }
}

export function DatasetInsightsView({ datasetId, datasetName }: DatasetInsightsViewProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sampleRows, setSampleRows] = useState<Array<Record<string, unknown>>>([]);
  const [sampleLoading, setSampleLoading] = useState(true);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("confidence-desc");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateStatus, setGenerateStatus] = useState<string | null>(null);
  const [refreshExisting, setRefreshExisting] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchInsights(datasetId, controller.signal)
      .then((payload) => {
        setInsights(payload);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        console.error(error);
        setLoadError(error instanceof Error ? error.message : "Unable to load insights");
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [datasetId, reloadToken]);

  useEffect(() => {
    const controller = new AbortController();
    setSampleLoading(true);
    setSampleError(null);

    fetchPreviewRows(datasetId, controller.signal)
      .then((rows) => {
        setSampleRows(rows);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        console.error(error);
        setSampleError(error instanceof Error ? error.message : "Unable to load preview data");
      })
      .finally(() => {
        setSampleLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [datasetId]);

  const handleReload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setGenerateStatus("Generating insights. This may take a moment...");

    try {
      const response = await fetch(`/api/v1/insights/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ dataset_id: datasetId, refresh: refreshExisting }),
      });

      if (!response.ok) {
        let detail = "Unable to generate insights";
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

      const payload = (await response.json()) as { insights: RawInsight[] };
      const processed = payload.insights.map((item) => ({
        ...item,
        confidence: parseConfidence(item.confidence),
      }));
      setInsights(processed);
      setGenerateStatus("Insights updated successfully");
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      statusTimeoutRef.current = setTimeout(() => {
        setGenerateStatus(null);
        statusTimeoutRef.current = null;
      }, 4000);
    } catch (error) {
      console.error(error);
      setGenerateError(error instanceof Error ? error.message : "Unable to generate insights");
      setGenerateStatus(null);
    } finally {
      setIsGenerating(false);
    }
  }, [datasetId, refreshExisting]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    insights.forEach((insight) => {
      if (insight.insight_type) {
        types.add(insight.insight_type);
      }
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [insights]);

  const filteredInsights = useMemo(() => {
    const subset = insights.filter((insight) => {
      if (selectedType !== "all" && insight.insight_type !== selectedType) {
        return false;
      }
      if (!matchesConfidence(confidenceFilter, insight.confidence)) {
        return false;
      }
      return true;
    });

    return subset.sort((a, b) => {
      switch (sortOption) {
        case "confidence-asc": {
          const left = a.confidence ?? -1;
          const right = b.confidence ?? -1;
          return left - right;
        }
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: {
          const left = a.confidence ?? -1;
          const right = b.confidence ?? -1;
          return right - left;
        }
      }
    });
  }, [insights, selectedType, confidenceFilter, sortOption]);

  const renderInsights = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-dashed">
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (loadError) {
      return (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="space-y-1">
              <CardTitle className="text-base">Unable to load insights</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleReload} disabled={isLoading}>
              Try again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (filteredInsights.length === 0) {
      return (
        <Card className="border-dashed bg-[var(--color-surface-muted)]/40">
          <CardHeader className="flex flex-row items-center gap-3">
            <Sparkles className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            <div className="space-y-1">
              <CardTitle className="text-base">No insights yet</CardTitle>
              <CardDescription>
                {insights.length === 0
                  ? "Generate insights to uncover notable patterns in your dataset."
                  : "Adjust your filters or generate a fresh set of insights."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                </>
              ) : (
                "Generate insights"
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredInsights.map((insight) => {
          const confidence = confidenceLabel(insight.confidence);
          return (
            <Card key={insight.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle className="text-lg text-[var(--color-foreground)]">{insight.title}</CardTitle>
                  <CardDescription className="capitalize text-[var(--color-muted-foreground)]">
                    {insight.insight_type.replace(/_/g, " ")}
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                    toneClassName(confidence.tone),
                  )}
                >
                  {confidence.label}
                </span>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{insight.description}</p>

                {insight.chart_config ? (
                  sampleLoading ? (
                    <Skeleton className="h-56 w-full" />
                  ) : sampleError ? (
                    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 p-4 text-sm text-[var(--color-muted-foreground)]">
                      Unable to load sample data for charts: {sampleError}
                    </div>
                  ) : (
                    <InsightChart chartConfig={insight.chart_config} sampleRows={sampleRows} />
                  )
                ) : null}

                <p className="mt-auto text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Generated {formatDate(insight.created_at)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              Insight generation
            </CardTitle>
            <CardDescription>
              Generate or refresh automated observations for <span className="font-semibold text-[var(--color-foreground)]">{datasetName}</span>.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                checked={refreshExisting}
                onChange={(event) => setRefreshExisting(event.target.checked)}
              />
              Replace existing insights
            </label>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate insights
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReload} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh list
            </Button>
          </div>
        </CardHeader>
        {(generateError || generateStatus) && (
          <CardContent>
            {generateStatus ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">{generateStatus}</p>
            ) : null}
            {generateError ? (
              <p className="text-sm text-destructive">{generateError}</p>
            ) : null}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Insight library</CardTitle>
            <CardDescription>
              Explore generated findings. Use the controls to focus on the most relevant insights for your analysis.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <span className="text-[var(--color-muted-foreground)]">Filter by type</span>
              <select
                className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <option value="all">All types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-muted-foreground)]">Confidence</span>
              <select
                className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                value={confidenceFilter}
                onChange={(event) => setConfidenceFilter(event.target.value as ConfidenceFilter)}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-muted-foreground)]">Sort</span>
              <select
                className="rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
              >
                <option value="confidence-desc">Confidence (high → low)</option>
                <option value="confidence-asc">Confidence (low → high)</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderInsights()}</CardContent>
      </Card>
    </div>
  );
}
