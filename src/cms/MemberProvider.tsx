import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../lib/api";
import { requireSupabaseAuth, supabaseAuth } from "../lib/supabase";

export type Member = {
  id: string;
  membershipNo: string;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  chapter: string;
  homeState: string;
  isVolunteer: boolean;
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

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  emirate: string;
  homeState: string;
  isVolunteer: boolean;
  password: string;
};

type MemberContextValue = {
  member: Member | null;
  registrations: EventRegistration[];
  volunteerShifts: VolunteerShift[];
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  requestPhoneOtp: (phone: string) => Promise<{ phone: string; expiresInSeconds: number }>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  addHours: (payload: { date: string; hours: number; activity: string }) => Promise<void>;
  becomeVolunteer: () => Promise<void>;
};

const MemberContext = createContext<MemberContextValue>({
  member: null,
  registrations: [],
  volunteerShifts: [],
  ready: false,
  signIn: async () => undefined,
  requestPhoneOtp: async () => ({ phone: "", expiresInSeconds: 0 }),
  verifyPhoneOtp: async () => undefined,
  register: async () => ({ needsEmailConfirmation: false }),
  signOut: async () => undefined,
  refresh: async () => undefined,
  addHours: async () => undefined,
  becomeVolunteer: async () => undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      async requestPhoneOtp(phone) {
        const checked = await api<{ phone: string }>("/api/members/check-phone", { method: "POST", body: JSON.stringify({ phone }) });
        return api<{ phone: string; expiresInSeconds: number }>("/api/members/otp/request", {
          method: "POST",
          body: JSON.stringify({ phone: checked.phone }),
        });
      },
      async verifyPhoneOtp(phone, code) {
        await api("/api/members/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) });
      },
      async register(payload) {
        const { data, error } = await requireSupabaseAuth().auth.signUp({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          options: {
            data: {
              // The create_ipf_profile() DB trigger (server/migrations/007_signup_trigger_and_admin_integrity.sql)
              // fires only when `phone` metadata is present, which is what distinguishes a real
              // member signup from the admin-only auth users ensureAdminSeed() creates.
              name: payload.name.trim(),
              phone: payload.phone,
              emirate: payload.emirate,
              home_state: payload.homeState,
              is_volunteer: payload.isVolunteer,
            },
          },
        });
        if (error) throw error;
        if (!data.session) return { needsEmailConfirmation: true };
        await refresh();
        return { needsEmailConfirmation: false };
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
      async becomeVolunteer() {
        await api("/api/members/become-volunteer", { method: "POST" });
        setMember((prev) => (prev ? { ...prev, isVolunteer: true } : prev));
      },
    }),
    [member, ready, registrations, volunteerShifts],
  );

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  return useContext(MemberContext);
}
