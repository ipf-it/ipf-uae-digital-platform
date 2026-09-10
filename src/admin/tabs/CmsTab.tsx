import { useAdmin } from "../AdminProvider";
import ContentTab from "./ContentTab";
import TenantContentTab from "./TenantContentTab";

/** Routing consolidation only — global admins get the site-wide content editor, chapter/council
 * admins get their own page editor. Neither underlying component changes. */
export default function CmsTab() {
  const { isGlobalAdmin } = useAdmin();
  return isGlobalAdmin ? <ContentTab /> : <TenantContentTab />;
}
