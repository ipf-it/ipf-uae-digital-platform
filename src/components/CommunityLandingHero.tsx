import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { OrgTheme } from "../data/orgThemes";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { PlaceThemeArt } from "./PlaceThemeArt";

type Props = { id?: string; eyebrow: string; title: string; description: string; theme: OrgTheme; backTo: string; backLabel: string };

export function CommunityLandingHero({ id, eyebrow, title, description, theme, backTo, backLabel }: Props) {
  return (
    <section className={`org-hero org-motion-${theme.motion} relative isolate overflow-hidden text-white`} style={{ "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties}>
      {id ? <PlaceThemeArt id={id} kind="council" /> : null}
      <div className="org-hero-orbit" aria-hidden="true" />
      <div className="org-hero-grid" aria-hidden="true" />
      <div className="org-hero-thread org-hero-thread-a" aria-hidden="true" />
      <div className="org-hero-thread org-hero-thread-b" aria-hidden="true" />
      <Container className="special-council-hero-layout relative grid min-h-[34rem] items-start gap-10 py-14 lg:grid-cols-[1.1fr,0.9fr] lg:py-16">
        <div>
          <Link to={backTo} className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 hover:text-white">← {backLabel}</Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[var(--org-secondary)]">{eyebrow}</p>
          <h1 className="org-single-line-title mt-4 font-bold leading-[1.08]">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/82">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold"><Link to="/events">Explore activities <ArrowRight className="size-4" /></Link></Button>
            <Button asChild variant="secondary"><Link to="/register">Join the community</Link></Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
