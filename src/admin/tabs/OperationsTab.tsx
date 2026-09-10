import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SegmentedTabs } from "../../components/ui/Tabs";
import { useAdmin } from "../AdminProvider";
import ApprovalsView from "../operations/ApprovalsView";
import CheckInView from "../operations/CheckInView";
import EventsView from "../operations/EventsView";
import RegistrationsView from "../operations/RegistrationsView";

type SubTab = "events" | "registrations" | "checkin" | "approvals";

export default function OperationsTab() {
  const { isSuperAdmin } = useAdmin();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") as SubTab | null;
  const [tab, setTab] = useState<SubTab>(requested && requested !== "approvals" ? requested : requested === "approvals" && isSuperAdmin ? "approvals" : "events");

  useEffect(() => {
    if (tab === "approvals" && !isSuperAdmin) setTab("events");
  }, [tab, isSuperAdmin]);

  const items = [
    { value: "events" as const, label: "Events" },
    { value: "registrations" as const, label: "Registrations & duty" },
    { value: "checkin" as const, label: "Check-in" },
    ...(isSuperAdmin ? [{ value: "approvals" as const, label: "Approvals" }] : []),
  ];

  function onValueChange(value: SubTab) {
    setTab(value);
    setParams(value === "events" ? {} : { tab: value }, { replace: true });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Operations</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Run your events</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          Create and manage events, see who's registered or on volunteer duty, check members in at the door, and review submissions awaiting approval — all in one place.
        </p>
      </div>

      <SegmentedTabs value={tab} onValueChange={onValueChange} items={items} />

      {tab === "events" ? <EventsView /> : null}
      {tab === "registrations" ? <RegistrationsView /> : null}
      {tab === "checkin" ? <CheckInView /> : null}
      {tab === "approvals" && isSuperAdmin ? <ApprovalsView /> : null}
    </div>
  );
}
