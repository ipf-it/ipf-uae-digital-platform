import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { emirateNavItems, specialCouncils, stateCouncils, type OrgNavLink } from "../data/orgNav";
import { useLocale } from "../i18n/LocaleProvider";
import { cn } from "../lib/utils";

const bulletClass: Record<NonNullable<OrgNavLink["bullet"]>, string> = {
  saffron: "bg-[var(--ipf-saffron)]",
  green: "bg-[var(--ipf-green)]",
  navy: "bg-[var(--ipf-navy)]",
  violet: "bg-[var(--ipf-navy)]",
  pink: "bg-[var(--ipf-navy)]",
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
  bullet?: OrgNavLink["bullet"];
  onNavigate?: () => void;
}) {
  return (
    <li className="border-b border-[var(--ipf-line)]/80 last:border-0">
      <Link
        to={to}
        onClick={onNavigate}
        className="flex items-center gap-2.5 py-2 text-[13px] text-[var(--ipf-navy)] transition hover:text-[var(--ipf-green)]"
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", bulletClass[bullet ?? "navy"])} />
        {label}
      </Link>
    </li>
  );
}

export function ChaptersMegaMenu({ onNavigate }: MenuProps) {
  const { t } = useLocale();
  const left = emirateNavItems.slice(0, 4);
  const right = emirateNavItems.slice(4);

  return (
    <div className="px-4 py-5 sm:px-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ipf-saffron)]">{t("nav.emiratesChapters")}</p>
      <div className="mt-1.5 h-0.5 w-11 rounded-full bg-[var(--ipf-saffron)]" />
      <div className="mt-2 grid grid-cols-2 divide-x divide-[var(--ipf-line)]">
        <ul className="pr-5">
          {left.map((item) => (
            <MegaLink key={item.id} to={item.to} label={item.name} bullet="saffron" onNavigate={onNavigate} />
          ))}
        </ul>
        <ul className="pl-5">
          {right.map((item) => (
            <MegaLink key={item.id} to={item.to} label={item.name} bullet="saffron" onNavigate={onNavigate} />
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

export function CouncilsMegaMenu({ onNavigate }: MenuProps) {
  const { t } = useLocale();

  return (
    <NavPanel columns={3}>
      <MegaColumn title={t("nav.stateCouncils")} titleClass="text-[var(--ipf-green)]" barClass="bg-[var(--ipf-green)]">
        {stateCouncils.map((item) => (
          <MegaLink key={item.id} to={item.to} label={item.name} bullet="green" onNavigate={onNavigate} />
        ))}
      </MegaColumn>
      <MegaColumn title={t("nav.specialCouncils")} titleClass="text-[var(--ipf-navy)]" barClass="bg-[var(--ipf-navy)]">
        {specialCouncils.map((item) => (
          <MegaLink key={item.id} to={item.to} label={item.name} bullet="navy" onNavigate={onNavigate} />
        ))}
      </MegaColumn>
      <MegaColumn
        title={t("nav.ipfCares")}
        titleClass="text-[#c41e3a]"
        barClass="bg-[#c41e3a]"
        footer={
          <Link
            to="/support#community"
            onClick={onNavigate}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8a0a8] bg-[#fdf2f2] px-3 py-2.5 text-[13px] font-bold tracking-wide text-[#c41e3a] transition hover:bg-[#fae6e8]"
          >
            <Phone className="size-4" />
            {t("nav.ipfCares")}
          </Link>
        }
      >
        <li className="py-2 text-[13px] leading-6 text-[var(--ipf-muted)]">{t("page.councils.caresBody")}</li>
      </MegaColumn>
    </NavPanel>
  );
}

function MobileLinks({ items, onNavigate }: { items: OrgNavLink[]; onNavigate?: () => void }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={`${item.id}-${item.name}`}
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
  return (
    <div>
      <MobileLinks items={emirateNavItems} onNavigate={onNavigate} />
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
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-green)]">{t("nav.stateCouncils")}</p>
        <MobileLinks items={stateCouncils} onNavigate={onNavigate} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ipf-navy)]">{t("nav.specialCouncils")}</p>
        <MobileLinks items={specialCouncils} onNavigate={onNavigate} />
      </div>
      <Link
        to="/support#community"
        className="inline-flex items-center gap-2 rounded-lg border border-[#e8a0a8] bg-[#fdf2f2] px-3 py-2 text-sm font-bold text-[#c41e3a]"
        onClick={onNavigate}
      >
        <Phone className="size-4" />
        {t("nav.ipfCares")}
      </Link>
    </div>
  );
}
