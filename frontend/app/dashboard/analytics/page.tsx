import { TrendingUp, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const trendCards = [
  {
    title: "Weekly active users",
    value: "12,481",
    delta: "+5.2%",
    icon: Users2,
  },
  {
    title: "Engagement score",
    value: "78",
    delta: "+2.1%",
    icon: TrendingUp,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Analytics</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Monitor core engagement metrics and sentiment trends across your product.
          </p>
        </div>
        <Button size="sm">Create dashboard</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {trendCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>Trailing 7 days</CardDescription>
                </div>
                <span className="rounded-full bg-[var(--color-surface-muted)] p-2 text-[var(--color-muted-foreground)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-3xl font-semibold text-[var(--color-foreground)]">{card.value}</p>
                <p className="text-xs font-medium text-[var(--color-success)]">{card.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement over time</CardTitle>
          <CardDescription>
            Daily active users, sessions, and conversion rate plotted over the past 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-48 w-full" aria-hidden />
          <div className="flex flex-col gap-2 text-sm text-[var(--color-muted-foreground)] md:flex-row md:items-center md:justify-between">
            <span>Data refreshes every hour.</span>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
