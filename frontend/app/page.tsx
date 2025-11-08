import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Search } from "lucide-react";

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
import { Input } from "@/components/ui/input";

const metricCards = [
  {
    title: "Active users",
    description: "vs. last 30 days",
    value: "2,834",
    delta: "+12.4%",
  },
  {
    title: "Conversion rate",
    description: "Goal completion",
    value: "5.83%",
    delta: "+3.2%",
  },
  {
    title: "Avg. session length",
    description: "Across platforms",
    value: "4m 12s",
    delta: "-1.1%",
  },
  {
    title: "Churn rate",
    description: "Monthly",
    value: "2.4%",
    delta: "-0.6%",
  },
] as const;

const recentUpdates = [
  {
    id: "UP-1029",
    name: "Lifecycle automation",
    owner: "Growth",
    status: "Live",
    updatedAt: "2 hours ago",
  },
  {
    id: "UP-1023",
    name: "Attribution refresh",
    owner: "Marketing",
    status: "QA",
    updatedAt: "1 day ago",
  },
  {
    id: "UP-1014",
    name: "Churn cohort analysis",
    owner: "Revenue",
    status: "Design",
    updatedAt: "3 days ago",
  },
  {
    id: "UP-1010",
    name: "Infrastructure sizing",
    owner: "Platform",
    status: "Blocked",
    updatedAt: "6 days ago",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Overview
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Stay on top of product health and customer engagement in real time.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <Input
              placeholder="Search reports"
              leadingIcon={<Search className="h-4 w-4" />}
              aria-label="Search reports"
            />
          </div>
          <Button className="sm:w-auto">Create report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">{metric.value}</p>
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
                  {metric.delta}
                </span>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Performance snapshot</CardTitle>
              <CardDescription>
                Track your key product and revenue signals in one place.
              </CardDescription>
            </div>
            <Link
              href="#"
              className={buttonStyles({
                variant: "ghost",
                size: "sm",
                className:
                  "text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]",
              })}
            >
              View details
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] p-4">
              <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
                Weekly trend
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
                +18.2%
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Compared to the previous 7 days across all funnels.
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-[var(--color-foreground)] md:grid-cols-2">
              <li className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                Uptime maintained at 99.99%
              </li>
              <li className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                <Clock3 className="h-5 w-5 text-[var(--color-accent)]" />
                Median response time 212ms
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Signals that need your attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--color-foreground)]">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
              Segment &quot;Trial&quot; is trending +42% week over week.
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
              North America retention dipped below 92% yesterday.
            </div>
            <Button variant="ghost" size="sm" className="px-0 text-[var(--color-accent)] hover:text-[var(--color-accent-emphasis)]">
              Manage alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent initiatives</CardTitle>
            <CardDescription>Cross-functional projects tracked in InsightIQ.</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTableContainer>
            <DataTableHeader>
              <tr>
                <DataTableHead scope="col">ID</DataTableHead>
                <DataTableHead scope="col">Project</DataTableHead>
                <DataTableHead scope="col">Owner</DataTableHead>
                <DataTableHead scope="col">Status</DataTableHead>
                <DataTableHead scope="col">Updated</DataTableHead>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {recentUpdates.map((update) => (
                <DataTableRow key={update.id}>
                  <DataTableCell className="font-medium">{update.id}</DataTableCell>
                  <DataTableCell>{update.name}</DataTableCell>
                  <DataTableCell>{update.owner}</DataTableCell>
                  <DataTableCell>{update.status}</DataTableCell>
                  <DataTableCell>{update.updatedAt}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
