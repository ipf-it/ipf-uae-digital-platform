import { QrCode } from "./QrCode";
import { site } from "../data/site";
import type { Member } from "../cms/MemberProvider";

export function DigitalIdCard({ member }: { member: Member }) {
  const yuva = member.isVolunteer;
  // Deliberately just the membership number — an event-desk admin looks the rest up via the
  // check-in flow (server-side, authenticated), so the code itself doesn't need to carry a copy
  // of the member's name/chapter.
  const payload = member.membershipNo;

  return (
    <div
      className={
        yuva
          ? "overflow-hidden rounded-2xl bg-gradient-to-br from-[#c45c12] to-[var(--ipf-navy)] p-6 text-white shadow-[0_16px_40px_rgba(11,31,58,0.18)]"
          : "overflow-hidden rounded-2xl bg-[var(--ipf-navy)] p-6 text-white shadow-[0_16px_40px_rgba(11,31,58,0.18)]"
      }
    >
      <div className="ipf-tricolor mb-4" />
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ipf-gold)]">
        {yuva ? "Indian People's Forum UAE · IPF Yuva volunteer" : "Indian People's Forum UAE"}
      </p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-2xl font-bold">{member.name}</p>
          <p className="mt-1 text-sm text-white/75">{member.chapter || member.emirate || "UAE"}</p>
          <p className="mt-6 font-mono text-lg tracking-[0.14em] text-[var(--ipf-gold)]">{member.membershipNo}</p>
          <p className="mt-2 text-xs text-white/60">
            Issued {new Date(member.createdAt).toLocaleDateString("en-GB")} · Membership no.
          </p>
          <p className="mt-6 text-xs text-white/70">{site.office}</p>
        </div>
        <div className="shrink-0">
          <QrCode value={payload} alt={`${member.membershipNo} QR code`} />
        </div>
      </div>
    </div>
  );
}
