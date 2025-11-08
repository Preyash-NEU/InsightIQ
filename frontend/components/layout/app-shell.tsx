"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Menu,
  MoonStar,
  Settings,
  SunMedium,
  Users2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/customers", label: "Customers", icon: Users2 },
];

const secondaryNavigation = [
  { href: "/settings", label: "Settings", icon: Settings },
];

type ThemeMode = "light" | "dark";

function useThemePreference(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem("insightiq-theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    window.localStorage.setItem("insightiq-theme", mode);
  }, [mode]);

  return [mode, setMode];
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mode, setMode] = useThemePreference();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const themeToggleIcon = mode === "dark" ? SunMedium : MoonStar;

  const sidebarContent = useMemo(
    () => (
      <nav className="flex flex-1 flex-col gap-8">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Menu
          </p>
          <ul className="mt-3 space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground,#ffffff)] shadow-sm"
                        : "text-[var(--color-muted-foreground)] hover:bg-[color-mix(in srgb,var(--color-accent-soft) 65%,transparent)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-auto">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Workspace
          </p>
          <ul className="mt-3 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground,#ffffff)] shadow-sm"
                        : "text-[var(--color-muted-foreground)] hover:bg-[color-mix(in srgb,var(--color-accent-soft) 65%,transparent)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    ),
    [pathname],
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <aside className="hidden w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-6 text-[var(--color-sidebar-foreground)] md:flex">
        <div className="flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.22em]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground,#ffffff)]">
            IQ
          </span>
          InsightIQ
        </div>
        <div className="mt-8 flex flex-1 flex-col overflow-hidden">{sidebarContent}</div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden" aria-hidden={!sidebarOpen}>
          <div
            className="absolute inset-0 bg-black/50"
            data-sidebar-overlay
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative ml-0 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-6 text-[var(--color-sidebar-foreground)] shadow-2xl">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground,#ffffff)]">
                  IQ
                </span>
                InsightIQ
              </div>
              <Button
                aria-label="Close navigation"
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-[var(--color-sidebar-foreground)] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-8 flex flex-1 flex-col overflow-y-auto pb-6">{sidebarContent}</div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in srgb,var(--color-surface) 85%,transparent)] px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-[var(--color-muted-foreground)]">
                  InsightIQ
                </p>
                <h1 className="text-xl font-semibold leading-tight">Unified intelligence hub</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setMode(mode === "light" ? "dark" : "light")}
              >
                {themeToggleIcon === SunMedium ? (
                  <SunMedium className="h-5 w-5" />
                ) : (
                  <MoonStar className="h-5 w-5" />
                )}
              </Button>
              <Button variant="primary" size="sm">
                Invite team
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-[color-mix(in srgb,var(--color-surface-muted) 70%,transparent)] px-4 pb-10 pt-6 md:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
