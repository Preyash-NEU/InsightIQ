import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryWorkspace } from "./query-workspace";

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

export default async function DatasetQueriesPage({
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
              <CardTitle>Ask InsightIQ</CardTitle>
              <CardDescription>
                Explore <span className="font-semibold text-[var(--color-foreground)]">{dataset.name}</span> using
                conversational questions.
              </CardDescription>
            </div>
            <MessageSquare className="h-8 w-8 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {dataset.description || "Describe what you want to analyse, and we will translate it into SQL for you."}
            </p>
          </CardContent>
        </Card>
      </div>

      <QueryWorkspace datasetId={dataset.id} datasetName={dataset.name} />
    </div>
  );
}
