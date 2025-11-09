import { CheckCircle2, Search, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const customerSegments = [
  {
    name: "Enterprise",
    accounts: 48,
    health: "Stable",
  },
  {
    name: "Growth",
    accounts: 126,
    health: "Improving",
  },
  {
    name: "Startups",
    accounts: 284,
    health: "At risk",
  },
];

const customerList = [
  {
    name: "Northwind Traders",
    owner: "Alex Rivera",
    plan: "Enterprise",
    status: "Green",
  },
  {
    name: "Acme Manufacturing",
    owner: "Jordan Kim",
    plan: "Growth",
    status: "Yellow",
  },
  {
    name: "Aurora Labs",
    owner: "Priya Patel",
    plan: "Growth",
    status: "Green",
  },
  {
    name: "Blue Harbor",
    owner: "Morgan Lee",
    plan: "Startups",
    status: "Red",
  },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Customers</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Track health across strategic accounts and identify where to invest next.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <Input placeholder="Search customers" leadingIcon={<Search className="h-4 w-4" />} aria-label="Search customers" />
          </div>
          <Button size="sm">Add customer</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {customerSegments.map((segment) => (
          <Card key={segment.name}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{segment.name}</CardTitle>
                <CardDescription>{segment.accounts} active accounts</CardDescription>
              </div>
              <span className="rounded-full bg-[var(--color-surface-muted)] p-2 text-[var(--color-muted-foreground)]">
                <Users2 className="h-5 w-5" aria-hidden />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-muted-foreground)]">Overall health: {segment.health}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Customer watchlist</CardTitle>
            <CardDescription>Accounts with significant shifts in engagement or revenue.</CardDescription>
          </div>
          <Button variant="outline" size="sm" icon={<CheckCircle2 className="h-4 w-4" />}>
            Mark all reviewed
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <DataTableContainer>
            <DataTableHeader>
              <tr>
                <DataTableHead>Name</DataTableHead>
                <DataTableHead>Owner</DataTableHead>
                <DataTableHead>Plan</DataTableHead>
                <DataTableHead>Status</DataTableHead>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {customerList.map((customer) => (
                <DataTableRow key={customer.name}>
                  <DataTableCell className="font-medium text-[var(--color-foreground)]">{customer.name}</DataTableCell>
                  <DataTableCell>{customer.owner}</DataTableCell>
                  <DataTableCell>{customer.plan}</DataTableCell>
                  <DataTableCell>{customer.status}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
