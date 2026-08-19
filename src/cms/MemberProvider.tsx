import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../lib/api";

export type Member = {
  id: string;
  kind: "member" | "yuva";
  membershipNo: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  createdAt: string;
  volunteerHours: { id: string; date: string; hours: number; activity: string }[];
};

export type EventRegistration = {
  eventId: string;
  eventTitle: string;
  registrationNo: string;
  createdAt: string;
};

export type VolunteerShift = {
  eventId: string;
  eventTitle: string;
  status: string;
  createdAt: string;
};

type MeResponse = {
  member: Member;
  registrations?: EventRegistration[];
  volunteerShifts?: VolunteerShift[];
};

type MemberContextValue = {
  member: Member | null;
  registrations: EventRegistration[];
  volunteerShifts: VolunteerShift[];
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    emirate: string;
    password: string;
    kind: "member" | "yuva";
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  addHours: (payload: { date: string; hours: number; activity: string }) => Promise<void>;
};

const MemberContext = createContext<MemberContextValue>({
  member: null,
  registrations: [],
  volunteerShifts: [],
  ready: false,
  signIn: async () => undefined,
  register: async () => undefined,
  signOut: async () => undefined,
  refresh: async () => undefined,
  addHours: async () => undefined,
});

export function MemberProvider({ children }: PropsWithChildren) {
  const [member, setMember] = useState<Member | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const result = await api<MeResponse>("/api/members/me");
      setMember(result.member);
      setRegistrations(result.registrations ?? []);
      setVolunteerShifts(result.volunteerShifts ?? []);
    } catch {
      setMember(null);
      setRegistrations([]);
      setVolunteerShifts([]);
    }
    setReady(true);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      registrations,
      volunteerShifts,
      ready,
      async signIn(email, password) {
        const result = await api<{ member: Member }>("/api/members/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setMember(result.member);
        await refresh();
      },
      async register(payload) {
        const result = await api<{ member: Member }>("/api/members/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMember(result.member);
        await refresh();
      },
      async signOut() {
        await api("/api/members/logout", { method: "POST" }).catch(() => undefined);
        setMember(null);
        setRegistrations([]);
        setVolunteerShifts([]);
      },
      refresh,
      async addHours(payload) {
        const result = await api<{ member: Member }>("/api/members/hours", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMember(result.member);
      },
    }),
    [member, ready, registrations, volunteerShifts],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  return useContext(MemberContext);
}
