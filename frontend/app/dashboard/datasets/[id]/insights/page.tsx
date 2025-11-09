import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DatasetInsightsView } from "./dataset-insights-view";

interface DatasetSummary {
  id: string;
  name: string;
  description?: string | null;
}

async function fetchDatasetSummary(id: string): Promise<DatasetSummary> {
  const response = await fetch(`/api/v1/datasets/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load dataset");
  }

  return (await response.json()) as DatasetSummary;
}

export default async function DatasetInsightsPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dataset = await fetchDatasetSummary(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href={`/dashboard/datasets/${dataset.id}`}
          className={buttonStyles({
            variant: "ghost",
            size: "sm",
            className: "w-fit gap-2 text-[var(--color-muted-foreground)]",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dataset overview
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex-1 space-y-2">
              <CardTitle>Automated insights</CardTitle>
              <CardDescription>
                Discover patterns in <span className="font-semibold text-[var(--color-foreground)]">{dataset.name}</span>{" "}
                using InsightIQ&apos;s heuristic analysis.
              </CardDescription>
            </div>
            <Sparkles className="h-8 w-8 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {dataset.description ||
                "Generate statistically-driven observations, complete with visual summaries and confidence scores."}
            </p>
          </CardContent>
        </Card>
      </div>

      <DatasetInsightsView datasetId={dataset.id} datasetName={dataset.name} />
    </div>
  );
}
