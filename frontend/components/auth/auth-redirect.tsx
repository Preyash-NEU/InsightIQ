"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/app/providers";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  if (user) {
    return null;
  }

  return <>{loading ? <div className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">Preparing workspace...</div> : children}</>;
}
