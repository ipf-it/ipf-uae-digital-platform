import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { socialLinks } from "../data/navigation";
import { useLocale } from "../i18n/LocaleProvider";
import { useHomeContent } from "../hooks/useHomeContent";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

/**
 * Brand-mark glyphs for the four social controls. Inline SVGs keep the section
 * dependency-free (the installed `lucide-react` build does not ship Facebook /
 * Instagram / Twitter / YouTube icons). Each path is from the official brand
 * set, drawn on a 24×24 viewBox, and uses `currentColor` so the icon colour
 * follows the surrounding anchor's text class on hover/focus.
 *
 * These icons used to live in Footer.tsx; they moved here so the social group
 * exists in exactly one place on the public site — the Get Involved section
 * directly above the footer.
 */
const SOCIAL_ICONS: Record<string, ReactNode> = {
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54v-2.22c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  "X / Twitter": (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.653l-5.214-6.817-5.966 6.817H1.683l7.73-8.835L1.254 2.25h6.829l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.016 3.016 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.121 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.569V8.431L15.818 12z" />
    </svg>
  ),
};

/**
 * Final call-to-action band above the footer. Two visual zones on desktop:
 *   left (~65%)  — Get Involved mission + four CTAs
 *   right (~35%) — Follow Us label + four social icons
 * Mobile stacks naturally with CTAs first, Follow Us immediately below.
 */
export function HomeGetInvolved() {
  const { t } = useLocale();
  const home = useHomeContent();
  const h = (key: keyof NonNullable<typeof home>, fallbackKey: string) =>
    home?.[key] || t(fallbackKey);

  return (
    <section className="bg-[#5A0F1E] py-7 sm:py-9 lg:py-10 text-white">
      <Container>
        <div className="grid gap-7 lg:grid-cols-[1.9fr_1fr] lg:items-center lg:gap-12 xl:gap-16">
          {/* LEFT — mission + CTA row */}
          <div className="min-w-0">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--ipf-gold)] sm:text-[0.75rem]">
              {h("join_eyebrow", "home.getInvolved")}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-[1.1] tracking-tight text-[#FFF8EE] sm:text-[1.75rem] lg:text-[2rem]">
              {h("join_title", "home.joinTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-[#FFF8EE]/85 sm:text-base">
              {h("join_desc", "home.joinDesc")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {/* Primary — saffron with deep-burgundy text per spec */}
              <Button asChild variant="gold" className="text-[#3A0913] shadow-[0_6px_20px_rgba(255,153,51,0.35)]">
                <Link to="/membership">{t("nav.joinLong")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/yuva">{t("nav.yuva")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/contact">{t("home.contactIpf")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/donate">{t("nav.donate")}</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT — Follow Us. A hairline ivory divider on desktop reads as one
             section, not two separate boxes. On mobile the divider becomes a
             top border above the social row for the same effect vertically. */}
          <div className="min-w-0 border-t border-[#FFF8EE]/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 xl:pl-14">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--ipf-gold)] sm:text-[0.75rem]">
              Follow us
            </p>
            <ul className="mt-4 flex items-center gap-3">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5A0F1E] shadow-[0_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-white/70 transition hover:bg-[var(--ipf-gold)] hover:text-[#5A0F1E] hover:ring-[var(--ipf-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)] lg:h-12 lg:w-12"
                  >
                    {SOCIAL_ICONS[item.label] ?? (
                      <span className="text-xs font-semibold">{item.label.slice(0, 2)}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
