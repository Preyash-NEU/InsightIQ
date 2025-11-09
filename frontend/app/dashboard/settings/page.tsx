import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Workspace settings</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Configure workspace preferences and notifications for your team.
        </p>
      </div>

      <form className="grid gap-6" aria-label="Workspace settings">
        <section aria-labelledby="profile-heading">
          <Card>
            <CardHeader>
              <CardTitle id="profile-heading">Profile</CardTitle>
              <CardDescription>Update your contact details and display information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
                Display name
                <input
                  type="text"
                  name="displayName"
                  placeholder="Your name"
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-foreground)]">
                Notification email
                <input
                  type="email"
                  name="notificationEmail"
                  placeholder="name@company.com"
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                />
              </label>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="preferences-heading">
          <Card>
            <CardHeader>
              <CardTitle id="preferences-heading">Notifications</CardTitle>
              <CardDescription>Choose when to receive alerts about activity in InsightIQ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[var(--color-foreground)]">
              <label className="flex items-center justify-between gap-3">
                <span>Weekly health summary</span>
                <input type="checkbox" name="weeklySummary" className="h-4 w-4" defaultChecked />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Customer churn alerts</span>
                <input type="checkbox" name="churnAlerts" className="h-4 w-4" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Dataset processing updates</span>
                <input type="checkbox" name="datasetUpdates" className="h-4 w-4" defaultChecked />
              </label>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="reset" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
