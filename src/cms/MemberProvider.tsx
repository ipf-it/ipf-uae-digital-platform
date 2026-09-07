import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

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
      if (!supabaseAuth || !(await supabaseAuth.auth.getSession()).data.session) throw new Error("Signed out");
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
    if (!supabaseAuth) return;
    const { data } = supabaseAuth.auth.onAuthStateChange(() => void refresh());
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<MemberContextValue>(
    () => ({
      member,
      registrations,
      volunteerShifts,
      ready,
      async signIn(email, password) {
        const { error } = await requireSupabaseAuth().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        await refresh();
      },
      async register(payload) {
        const checked = await api<{ phone: string }>("/api/members/check-phone", { method: "POST", body: JSON.stringify({ phone: payload.phone }) });
        const { data, error } = await requireSupabaseAuth().auth.signUp({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          options: { data: { name: payload.name.trim(), phone: checked.phone, emirate: payload.emirate, account_kind: payload.kind } },
        });
        if (error) throw error;
        if (!data.session) throw new Error("Check your email to confirm the account, then sign in to finish registration.");
        await refresh();
      },
      async signOut() {
        if (supabaseAuth) await supabaseAuth.auth.signOut();
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
