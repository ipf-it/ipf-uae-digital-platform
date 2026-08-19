import { Link } from "react-router-dom";
import { CalendarDays, MapPin, UserRound, Users } from "lucide-react";
import { useCms } from "../cms/ContentProvider";
import { useCommunityStats } from "../hooks/useCommunityStats";
import { useLocale } from "../i18n/LocaleProvider";
import { Container } from "./ui/Container";
import { Section } from "./ui/Section";
import { SectionTitle } from "./ui/SectionTitle";

const cards = [
  { key: "members", to: "/membership", icon: Users, label: "stat.members", hint: "stat.membersHint" },
  { key: "yuva", to: "/yuva", icon: UserRound, label: "stat.yuva", hint: "stat.yuvaHint" },
  { key: "events", to: "/events", icon: CalendarDays, label: "stat.eventsLive", hint: "stat.eventsHint" },
  { key: "chapters", to: "/chapters", icon: MapPin, label: "stat.chapters", hint: "stat.chaptersHint" },
] as const;

export function CommunityStats() {
  const { t } = useLocale();
  const { content } = useCms();
  const counts = useCommunityStats(content.eventHighlights.length);

  return (
    <Section tone="white" className="py-10 sm:py-12 lg:py-14">
      <Container>
        <SectionTitle eyebrow={t("home.communityNow")} title={t("home.communityTitle")} description={t("home.communityDesc")} />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.key}
                to={card.to}
                className="min-w-0 rounded-2xl border border-[var(--ipf-line)] bg-[var(--ipf-paper)] p-4 shadow-[0_8px_24px_rgba(11,31,58,0.05)] transition hover:-translate-y-0.5 hover:border-[var(--ipf-navy)]/30 hover:shadow-[0_12px_28px_rgba(11,31,58,0.08)] sm:p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ipf-ivory)] text-[var(--ipf-navy)]">
                  <Icon size={18} />
                </span>
                <p className="mt-4 text-3xl font-bold tabular-nums leading-none text-[var(--ipf-navy)] sm:text-4xl">
                  {counts[card.key]}
                </p>
                <p className="mt-2 break-words text-sm font-semibold leading-snug text-[var(--ipf-navy)]">{t(card.label)}</p>
                <p className="mt-1 break-words text-xs leading-5 text-[var(--ipf-muted)]">{t(card.hint)}</p>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
