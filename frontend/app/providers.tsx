"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ToastProvider } from "@/components/ui/toast";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
  is_active: boolean;
  created_at: string;
};

type UserContextValue = {
  user: AuthenticatedUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: AuthenticatedUser | null) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as AuthenticatedUser;
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch authenticated user", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      setUser,
    }),
    [user, loading, refresh, setUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ToastProvider>{children}</ToastProvider>
    </UserProvider>
  );
}
