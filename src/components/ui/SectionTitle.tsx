import { cn } from "../../lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  tone?: "dark" | "light";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
  tone = "dark",
}: SectionTitleProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow ? (
        <p
          className={cn(
            "section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.22em]",
            tone === "light" ? "text-[var(--ipf-gold)]" : "text-[var(--ipf-green)]",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("text-2xl font-bold break-words sm:text-3xl", tone === "light" ? "text-white" : "text-[var(--ipf-navy)]")}>
        {title}
      </h2>
      <div
        className={cn(
          "mt-3 h-1 w-16 bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]",
          centered ? "mx-auto" : "",
        )}
      />
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-3xl text-sm leading-7 sm:text-base",
            tone === "light" ? "text-white/80" : "text-[var(--ipf-muted)]",
            centered ? "mx-auto" : "",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
