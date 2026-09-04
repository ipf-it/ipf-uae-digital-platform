import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarDays, MapPinned, Users } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import uaeMap from "../data/uaeMap.json";
import type { OrgTheme } from "../data/orgThemes";
import { Button } from "./ui/Button";
import { PlaceThemeArt } from "./PlaceThemeArt";

const abuDhabi = uaeMap.locations.find((item) => item.id === "abu-dhabi");

export function ChapterJourneyHero({ id, title, description, theme }: { id: string; title: string; description: string; theme: OrgTheme }) {
  const reduce = useReducedMotion();
  const style = { "--org-primary": theme.primary, "--org-secondary": theme.secondary, "--org-accent": theme.accent } as CSSProperties;
  return (
    <section className={`chapter-journey-hero org-motion-${theme.motion}`} style={style}>
      <div className="chapter-sand-flow" aria-hidden="true" />
      <div className="chapter-sky-orbit" aria-hidden="true" />
      <div className="state-journey-layout relative mx-auto grid w-full max-w-[96rem] items-center gap-10">
        <motion.div initial={reduce ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }}>
          <Link to="/chapters" className="text-xs font-semibold uppercase tracking-[.18em] text-white/65 hover:text-white">← UAE chapters</Link>
          <p className="mt-9 text-xs font-bold uppercase tracking-[.25em] text-[var(--org-secondary)]">Seven Emirates · One community</p>
          <h1 className="org-single-line-title mt-4 font-bold leading-[1.04] text-white">{title} Chapter</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="gold"><Link to="/events">Chapter events <ArrowRight className="size-4" /></Link></Button><Button asChild variant="secondary"><Link to="/register">Join this chapter</Link></Button></div>
        </motion.div>
        <PlaceThemeArt id={id} kind="chapter" />
        <motion.div className="chapter-map-stage" initial={reduce ? false : { opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .85, delay: .15 }}>
          <p className="state-map-kicker"><MapPinned className="size-4" /> Your chapter on the UAE map</p>
          <svg viewBox={uaeMap.viewBox} role="img" aria-label={`${title} highlighted on the UAE map`} className="chapter-map-svg">
            <defs><clipPath id={`chapter-abu-land-${id}`} clipPathUnits="userSpaceOnUse"><path d={abuDhabi?.path} /></clipPath><mask id={`chapter-abu-mask-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="760" height="613"><rect width="760" height="613" fill="white"/><path d={uaeMap.alAinClip} fill="black"/></mask></defs>
            {uaeMap.locations.filter((item) => item.id !== "abu-dhabi").map((item) => <motion.path key={item.id} d={item.path} className={item.id === id ? "is-selected" : ""} animate={item.id === id && !reduce ? { opacity: [1,.62,1] } : undefined} transition={{ duration: 2.8, repeat: Infinity }}><title>{item.name}</title></motion.path>)}
            {abuDhabi ? <><motion.path d={abuDhabi.path} mask={`url(#chapter-abu-mask-${id})`} className={id === "abu-dhabi" ? "is-selected" : ""} animate={id === "abu-dhabi" && !reduce ? { opacity:[1,.62,1] } : undefined}/><motion.path d={uaeMap.alAinClip} clipPath={`url(#chapter-abu-land-${id})`} className={id === "al-ain" ? "is-selected" : ""} animate={id === "al-ain" && !reduce ? { opacity:[1,.62,1] } : undefined}/></> : null}
          </svg>
          <div className="state-journey-steps">{[[MapPinned,"Local desk","Emirate-scoped service"],[CalendarDays,"Activities","Created by chapter admins"],[Users,"Community","Members and Yuva together"]].map(([StepIcon,label,note],index)=>{const JourneyIcon=StepIcon as typeof MapPinned;return <motion.div key={String(label)} initial={reduce?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.45+index*.14}}><JourneyIcon className="size-4"/><span><strong>{String(label)}</strong><small>{String(note)}</small></span></motion.div>})}</div>
        </motion.div>
      </div>
    </section>
  );
}
