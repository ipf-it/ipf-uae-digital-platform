import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SegmentedTabs } from "../../components/ui/Tabs";
import { useAdmin } from "../AdminProvider";
import ContentTab from "./ContentTab";
import TenantContentTab from "./TenantContentTab";
import PagesTab from "./PagesTab";
import OrganisationTab from "./OrganisationTab";
import PublicationsTab from "./PublicationsTab";
import NavigationTab from "./NavigationTab";

type GlobalSubTab = "pages" | "organisation" | "publications" | "navigation" | "media";
type ScopedSubTab = "page" | "committee";

const globalItems = [
  { value: "pages" as const, label: "Pages & homepage" },
  { value: "organisation" as const, label: "Chapters, councils & leadership" },
  { value: "publications" as const, label: "Publications" },
  { value: "navigation" as const, label: "Navigation" },
  { value: "media" as const, label: "Media & news" },
];

const scopedItems = [
  { value: "page" as const, label: "Your landing page" },
  { value: "committee" as const, label: "Your committee" },
];

/** The single "Content" hub — everything that used to be scattered across separate Pages /
 * Publications / Navigation / Organisation sidebar entries now lives here as sub-tabs, same
 * pattern Operations already uses for Events/Activities/Sponsors/Approvals. A global admin sees
 * every content surface in the platform from here; a chapter/council admin sees exactly two —
 * their own landing page and their own committee — both of which still require super-admin
 * approval before anything goes live, same as everywhere else. */
export default function CmsTab() {
  const { admin, isGlobalAdmin } = useAdmin();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const [globalTab, setGlobalTab] = useState<GlobalSubTab>((requested as GlobalSubTab) || "pages");
  const [scopedTab, setScopedTab] = useState<ScopedSubTab>((requested as ScopedSubTab) || "page");

  useEffect(() => {
    if (requested) {
      if (isGlobalAdmin) setGlobalTab(requested as GlobalSubTab);
      else setScopedTab(requested as ScopedSubTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isGlobalAdmin) {
    // Editors are content-only — they never get committee/organisational responsibility, so the
    // "Your committee" sub-tab is chapter_admin/council_admin only, same restriction the old
    // standalone Organisation nav item enforced before it was folded in here.
    const canManageCommittee = admin?.role !== "editor";
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Content</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">{canManageCommittee ? "Manage your page & committee" : "Manage your page"}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
            Everything here is scoped to your own chapter/council only — you can't see or change any other chapter or council. Changes you make go live only after a super admin approves them.
          </p>
        </div>
        {canManageCommittee ? (
          <>
            <SegmentedTabs
              value={scopedTab}
              onValueChange={(value) => {
                setScopedTab(value);
                setParams({ tab: value }, { replace: true });
              }}
              items={scopedItems}
            />
            {scopedTab === "page" ? <TenantContentTab /> : <OrganisationTab />}
          </>
        ) : (
          <TenantContentTab />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ipf-green)]">Content</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--ipf-navy)]">Everything on the site, in one place</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ipf-muted)]">
          Homepage, every informational page, chapters/councils/leadership, Drishti publications, site navigation, and legacy hero/gallery/news — all admin-editable, all live immediately for you.
        </p>
      </div>
      <SegmentedTabs
        value={globalTab}
        onValueChange={(value) => {
          setGlobalTab(value);
          setParams({ tab: value }, { replace: true });
        }}
        items={globalItems}
      />
      {globalTab === "pages" ? <PagesTab /> : null}
      {globalTab === "organisation" ? <OrganisationTab /> : null}
      {globalTab === "publications" ? <PublicationsTab /> : null}
      {globalTab === "navigation" ? <NavigationTab /> : null}
      {globalTab === "media" ? <ContentTab /> : null}
    </div>
  );
}
