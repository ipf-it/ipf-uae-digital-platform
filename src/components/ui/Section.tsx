import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

type SectionProps = PropsWithChildren<{
  id?: string;
  tone?: "ivory" | "white" | "navy" | "burgundy";
  className?: string;
}>;

export function Section({ id, tone = "ivory", className, children }: SectionProps) {
  const reduce = useReducedMotion();
  const toneClass =
    tone === "white"
      ? "bg-[var(--ipf-paper)]"
      : tone === "navy"
        ? "bg-[var(--ipf-navy)] text-white"
        : tone === "burgundy"
          ? "bg-[var(--ipf-burgundy)] text-white"
          : "bg-[var(--ipf-ivory)]";

  return (
    <motion.section
      id={id}
      className={cn("relative z-10 py-12 sm:py-16 lg:py-20", toneClass, className)}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}
