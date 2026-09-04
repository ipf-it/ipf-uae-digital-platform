import indiaMap from "@svg-maps/india";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, HeartHandshake, MapPinned, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { OrgTheme } from "../data/orgThemes";
import { Button } from "./ui/Button";
import { PlaceThemeArt } from "./PlaceThemeArt";

const stateMapIds: Record<string, string> = {
  kerala: "kl", karnataka: "ka", "andhra-pradesh": "ap", telangana: "tg", "tamil-nadu": "tn",
  maharashtra: "mh", gujarat: "gj", punjab: "pb", rajasthan: "rj", "uttar-pradesh": "up", bihar: "br",
  assam: "as", odisha: "or", "west-bengal": "wb", "madhya-pradesh": "mp", haryana: "hr", jharkhand: "jh",
  chhattisgarh: "ct", uttarakhand: "ut", "himachal-pradesh": "hp", goa: "ga", "arunachal-pradesh": "ar",
  manipur: "mn", meghalaya: "ml", mizoram: "mz", nagaland: "nl", sikkim: "sk", tripura: "tr",
};

// Telangana-only architectural motif, curated from the installed CC BY Game Icons collection.
const telanganaLandmarkPath = "M256 27.88c-8.97 10.574-20.842 21.506-33.637 33.347c-16.767 15.515-34.995 32.31-49.45 49.656c-14.453 17.345-24.872 35.13-27.25 51.994c-2.265 16.054 1.912 31.8 18.275 49.244h184.125c16.362-17.444 20.54-33.19 18.275-49.243c-2.38-16.865-12.798-34.65-27.252-51.994s-32.682-34.14-49.45-49.656C276.843 49.387 264.97 38.454 256 27.88M32 68.12c-16 16-16 32-16 48h7v71h-7v18h7v279h18v-279h7v-18h-7v-71h7c0-16 0-32-16-48m448 0c-16 16-16 32-16 48h7v71h-7v18h7v279h18v-279h7v-18h-7v-71h7c0-16 0-32-16-48m-368 137c-16 16-32 32-32 48v23h64v-23c0-16-16-32-32-48m288 0c-16 16-32 32-32 48v23h64v-23c0-16-16-32-32-48m-231 25v14h174v-14zm0 32v222h39v-135c0-16 32-48 48-64c16 16 48 48 48 64v135h39v-222zm-96 32v190h78v-190zm288 0v190h78v-190z";

export function CouncilJourneyHero({ id, title, region, description, theme }: { id: string; title: string; region: string; description: string; theme: OrgTheme }) {
  const reduce = useReducedMotion();
  const selectedId = stateMapIds[id];
  const style = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;

  return (
    <section className={`state-journey-hero state-theme-${id} state-motion-${theme.motion}`} data-council-theme={id} data-legacy-landmark={id === "__unused" ? telanganaLandmarkPath : undefined} style={style}>
      <div className="state-pattern-flow" aria-hidden="true" />
      <div className="state-journey-layout relative mx-auto grid w-full max-w-[96rem] items-center gap-10">
        <motion.div initial={reduce ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }}>
          <Link to="/councils" className="text-xs font-semibold uppercase tracking-[.18em] text-white/65 hover:text-white">← State councils</Link>
          <p className="mt-9 text-xs font-bold uppercase tracking-[.25em] text-[var(--org-secondary)]">{region}</p>
          <h1 className="org-single-line-title mt-4 font-bold leading-[1.04] text-white">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold"><Link to="/events">Council events <ArrowRight className="size-4" /></Link></Button>
            <Button asChild variant="secondary"><Link to="/register">Join this council</Link></Button>
          </div>
        </motion.div>
        <PlaceThemeArt id={id} kind="council" />
        <motion.div className="state-map-stage" initial={reduce ? false : { opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .85, delay: .15 }}>
          <p className="state-map-kicker"><MapPinned className="size-4" /> Our roots, our journey</p>
          <svg viewBox={indiaMap.viewBox} role="img" aria-label={`${region} highlighted on the map of India`} className="state-map-svg">
            {indiaMap.locations.map((location: { id: string; name: string; path: string }) => (
              <motion.path key={location.id} d={location.path} className={location.id === selectedId ? "is-selected" : ""} initial={false} animate={location.id === selectedId && !reduce ? { opacity: [1, .62, 1] } : undefined} transition={{ duration: 2.8, repeat: Infinity }}>
                <title>{location.name}</title>
              </motion.path>
            ))}
          </svg>
          <div className="state-journey-steps">
            {[[Sparkles, "Heritage", theme.motif], [HeartHandshake, "Community", "Belonging in the UAE"], [MapPinned, "Service", "Activities with measurable impact"]].map(([StepIcon, label, note], index) => {
              const JourneyIcon = StepIcon as typeof Sparkles;
              return <motion.div key={String(label)} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 + index * .14 }}><JourneyIcon className="size-4"/><span><strong>{String(label)}</strong><small>{String(note)}</small></span></motion.div>;
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
