import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../lib/api";

const tokenKey = "ipf-member-token";

export type Member = {
  id: string;
  membershipNo: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  createdAt: string;
  volunteerHours: { id: string; date: string; hours: number; activity: string }[];
};

type MemberContextValue = {
  member: Member | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; emirate: string; password: string }) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
  addHours: (payload: { date: string; hours: number; activity: string }) => Promise<void>;
};

const MemberContext = createContext<MemberContextValue>({
  member: null,
  ready: false,
  signIn: async () => undefined,
  register: async () => undefined,
  signOut: () => undefined,
  refresh: async () => undefined,
  addHours: async () => undefined,
});

export function MemberProvider({ children }: PropsWithChildren) {
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    const token = sessionStorage.getItem(tokenKey);
    if (!token) {
      setMember(null);
      setReady(true);
      return;
    }
    try {
      const result = await api<{ member: Member }>("/api/members/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMember(result.member);
    } catch {
      sessionStorage.removeItem(tokenKey);
      setMember(null);
    }
    setReady(true);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      ready,
      async signIn(email, password) {
        const result = await api<{ token: string; member: Member }>("/api/members/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        sessionStorage.setItem(tokenKey, result.token);
        setMember(result.member);
      },
      async register(payload) {
        const result = await api<{ token: string; member: Member }>("/api/members/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        sessionStorage.setItem(tokenKey, result.token);
        setMember(result.member);
      },
      signOut() {
        sessionStorage.removeItem(tokenKey);
        setMember(null);
      },
      refresh,
      async addHours(payload) {
        const token = sessionStorage.getItem(tokenKey);
        const result = await api<{ member: Member }>("/api/members/hours", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setMember(result.member);
      },
    }),
    [member, ready],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  return useContext(MemberContext);
}
