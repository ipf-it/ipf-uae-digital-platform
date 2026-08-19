import { site } from "../data/site";
import { cn } from "../lib/utils";

const letterTone = ["text-[var(--ipf-saffron)]", "text-white", "text-[var(--ipf-green)]"];

type BrandMarkProps = {
  size?: "splash" | "hero";
  reveal?: boolean;
  className?: string;
};

export function BrandMark({ size = "hero", reveal = true, className = "" }: BrandMarkProps) {
  const letters = site.brandMark.split("");
  const splash = size === "splash";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p
        className={cn(
          "font-black uppercase leading-none",
          splash ? "text-[2.85rem] tracking-[0.12em]" : "text-[1.7rem] tracking-[0.12em]",
        )}
        aria-label={site.brandMark}
      >
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={cn(
              letterTone[index] ?? "text-[var(--ipf-gold)]",
              splash && "ipf-splash-letter",
              splash && reveal && "is-on",
            )}
            style={splash ? { animationDelay: `${index * 120}ms` } : undefined}
          >
            {letter}
          </span>
        ))}
      </p>
      <span
        className={cn(
          "mt-2.5 h-[3px] w-[4.5rem] rounded-full bg-[linear-gradient(90deg,var(--ipf-saffron),#fff,var(--ipf-green))]",
          splash && "ipf-splash-rule",
          splash && reveal && "is-on",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
