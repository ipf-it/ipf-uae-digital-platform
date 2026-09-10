import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

export type Admin = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "central_content_admin" | "chapter_admin" | "council_admin" | "editor";
  scopeType: "global" | "chapter" | "council";
  scopeId: string | null;
  isGlobalAdmin: boolean;
};

type AdminContextValue = {
  admin: Admin | null;
  ready: boolean;
  mustChangePassword: boolean;
  isGlobalAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue>({
  admin: null,
  ready: false,
  mustChangePassword: false,
  isGlobalAdmin: false,
  isSuperAdmin: false,
  signOut: async () => undefined,
  changePassword: async () => undefined,
  refresh: async () => undefined,
});

export function AdminProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  async function refresh() {
    try {
      if (!supabaseAuth || !(await supabaseAuth.auth.getSession()).data.session) throw new Error("Signed out");
      const [{ admin: current }, { data: userData }] = await Promise.all([
        api<{ admin: Admin }>("/api/admin/session"),
        supabaseAuth.auth.getUser(),
      ]);
      setAdmin(current);
      setMustChangePassword(userData.user?.user_metadata?.must_change_password === true);
    } catch {
      setAdmin(null);
      setMustChangePassword(false);
    }
    setReady(true);
  }

  useEffect(() => {
    void refresh();
    if (!supabaseAuth) return;
    const { data } = supabaseAuth.auth.onAuthStateChange(() => void refresh());
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      admin,
      ready,
      mustChangePassword,
      isGlobalAdmin: admin?.isGlobalAdmin ?? false,
      isSuperAdmin: admin?.role === "super_admin",
      async signOut() {
        if (supabaseAuth) await supabaseAuth.auth.signOut();
        setAdmin(null);
        setMustChangePassword(false);
      },
      async changePassword(newPassword) {
        const auth = requireSupabaseAuth();
        const { data: userData } = await auth.auth.getUser();
        const { error } = await auth.auth.updateUser({
          password: newPassword,
          data: { ...(userData.user?.user_metadata ?? {}), must_change_password: false },
        });
        if (error) throw error;
        setMustChangePassword(false);
      },
      refresh,
    }),
    [admin, ready, mustChangePassword],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
