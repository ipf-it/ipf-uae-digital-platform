import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { chapterPath, councilPath } from "../data/orgNav";
import { useOrgChapters, useOrgCouncils } from "../hooks/useOrgDirectory";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

type Bullet = "saffron" | "green" | "navy";

const bulletClass: Record<Bullet, string> = {
  saffron: "bg-[var(--ipf-saffron)]",
  green: "bg-[var(--ipf-green)]",
  navy: "bg-[var(--ipf-navy)]",
};

type MenuProps = {
  onNavigate?: () => void;
};

export function NavPanel({ columns, children }: { columns: 1 | 2 | 3; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid divide-x divide-[var(--ipf-line)]",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function MegaColumn({
  title,
  titleClass,
  barClass,
  footer,
  children,
}: {
  title: string;
  titleClass: string;
  barClass: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col px-4 py-5 sm:px-5">
      <p className={cn("text-[11px] font-bold uppercase tracking-[0.16em]", titleClass)}>{title}</p>
      <div className={cn("mt-1.5 h-0.5 w-11 rounded-full", barClass)} />
      <ul className="mt-2 flex-1">{children}</ul>
      {footer}
    </div>
  );
}

export function MegaLink({
  to,
  label,
  bullet = "navy",
  onNavigate,
}: {
  to: string;
  label: string;
  bullet?: Bullet;
  onNavigate?: () => void;
}) {
  return (
    <li className="border-b border-[var(--ipf-line)]/80 last:border-0">
      <Link
        to={to}
        onClick={onNavigate}
        className="flex items-center gap-2.5 py-2 text-[13px] text-[var(--ipf-navy)] transition hover:text-[var(--ipf-green)]"
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", bulletClass[bullet])} />
        {label}
      </Link>
    </li>
  );
}

export function ChaptersMegaMenu({ onNavigate }: MenuProps) {
  const { t } = useLocale();
  const { chapters } = useOrgChapters();
  const left = chapters.slice(0, 4);
  const right = chapters.slice(4);

  return (
    <div className="px-4 py-5 sm:px-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-saffron)]">{t("nav.emiratesChapters")}</p>
      <div className="mt-1.5 h-0.5 w-11 rounded-full bg-[var(--ipf-saffron)]" />
      <div className="mt-2 grid grid-cols-2 divide-x divide-[var(--ipf-line)]">
        <ul className="pr-5">
          {left.map((item) => (
            <MegaLink key={item.id} to={chapterPath(item.id)} label={item.name} bullet="saffron" onNavigate={onNavigate} />
          ))}
        </ul>
        <ul className="pl-5">
          {right.map((item) => (
            <MegaLink key={item.id} to={chapterPath(item.id)} label={item.name} bullet="saffron" onNavigate={onNavigate} />
          ))}
        </ul>
      </div>
      <Link
        to="/chapters"
        onClick={onNavigate}
        className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--ipf-saffron)] hover:underline"
      >
        {t("nav.viewAll")}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

/* Trim trailing " Council" from state-council display labels inside this
 * menu only. The section header "STATE COUNCILS" already provides that
 * context, so repeating "Council" on every row wastes horizontal space and
 * forces long names like "Arunachal Pradesh Council" to wrap at narrow
 * column widths. This is a DISPLAY tweak — database records, routes and
 * accessible names elsewhere on the site are unchanged. */
function trimCouncilSuffix(name: string): string {
  return name.replace(/\s*Council\s*$/i, "");
}

export function CouncilsMegaMenu({ onNavigate }: MenuProps) {
  const { t } = useLocale();
  const { councils } = useOrgCouncils();
  const stateCouncils = councils.filter((item) => item.kind === "state");
  const specialCouncils = councils.filter((item) => item.kind === "special");

  return (
    <div className="px-5 py-5 lg:px-6 lg:py-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.6fr)_1px_minmax(0,1fr)] lg:gap-7">
        {/* ────── STATE COUNCILS — compact 3-column grid ────── */}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-green)]">
            {t("nav.stateCouncils")}
          </p>
          <div className="mt-1.5 h-0.5 w-11 rounded-full bg-[var(--ipf-green)]" />
          <ul
            role="list"
            className="mt-3 grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-3"
          >
            {stateCouncils.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to={councilPath(item.id)}
                  onClick={onNavigate}
                  aria-label={item.name}
                  className="flex items-center gap-2 py-1 text-[13px] leading-tight text-[var(--ipf-navy)] transition hover:text-[var(--ipf-green)]"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-[var(--ipf-green)]"
                  />
                  <span className="truncate">{trimCouncilSuffix(item.name)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Thin vertical rule separating the two groups (desktop only). */}
        <div
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--ipf-line)] lg:block"
        />

        {/* ────── SPECIAL COUNCILS — compact column ────── */}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-navy)]">
            {t("nav.specialCouncils")}
          </p>
          <div className="mt-1.5 h-0.5 w-11 rounded-full bg-[var(--ipf-navy)]" />
          <ul role="list" className="mt-3 flex flex-col gap-0.5">
            {specialCouncils.map((item) => (
              <li key={item.id}>
                <Link
                  to={councilPath(item.id)}
                  onClick={onNavigate}
                  className="flex items-center gap-2 py-1 text-[13px] leading-tight text-[var(--ipf-navy)] transition hover:text-[#5A0F1E]"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-[#5A0F1E]"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* View all councils — restrained editorial link, not a marketing button. */}
      <div className="mt-5 flex items-center gap-3 border-t border-[var(--ipf-line)] pt-4">
        <span
          aria-hidden="true"
          className="h-px w-8 bg-[#D6AD60]/60"
        />
        <Link
          to="/councils"
          onClick={onNavigate}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--ipf-navy)] transition hover:text-[var(--ipf-green)]"
        >
          <span>View all councils</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function MobileLinks({ items, onNavigate }: { items: { id: string; to: string; name: string }[]; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className="block rounded-lg py-1.5 pl-1 text-sm text-[var(--ipf-muted)] hover:text-[var(--ipf-navy)]"
          onClick={onNavigate}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}

export function ChaptersMobileList({ onNavigate }: MenuProps) {
  const { t } = useLocale();
  const { chapters } = useOrgChapters();
  return (
    <div>
      <MobileLinks items={chapters.map((item) => ({ id: item.id, to: chapterPath(item.id), name: item.name }))} onNavigate={onNavigate} />
      <Link
        to="/chapters"
        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ipf-saffron)]"
        onClick={onNavigate}
      >
        {t("nav.viewAll")}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function CouncilsMobileList({ onNavigate }: MenuProps) {
  const { t } = useLocale();
  const { councils } = useOrgCouncils();
  const stateCouncils = councils.filter((item) => item.kind === "state");
  const specialCouncils = councils.filter((item) => item.kind === "special");
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-green)]">
          {t("nav.stateCouncils")}
        </p>
        <MobileLinks
          items={stateCouncils.map((item) => ({
            id: item.id,
            to: councilPath(item.id),
            name: item.name,
          }))}
          onNavigate={onNavigate}
        />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-navy)]">
          {t("nav.specialCouncils")}
        </p>
        <MobileLinks
          items={specialCouncils.map((item) => ({
            id: item.id,
            to: councilPath(item.id),
            name: item.name,
          }))}
          onNavigate={onNavigate}
        />
      </div>
      {/* IPF Cares button intentionally removed from the Councils mobile list.
         IPF Cares remains reachable via the Support navigation / page as
         before — it just no longer lives inside this Councils menu. */}
      <Link
        to="/councils"
        className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ipf-navy)]"
        onClick={onNavigate}
      >
        View all councils
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
