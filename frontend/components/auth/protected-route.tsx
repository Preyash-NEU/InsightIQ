"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/app/providers";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (!user) {
    return loading ? (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        Checking authentication...
      </div>
    ) : null;
  }

  return <>{children}</>;
}
