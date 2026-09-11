import { cn } from "../../lib/utils";
import { TricolorFrame } from "./TricolorFrame";

type PersonIdentityProps = {
  src: string;
  alt: string;
  name: string;
  role: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  layout?: "row" | "stack";
  className?: string;
};

const photoSize = {
  sm: "aspect-[4/5] h-auto w-full",
  md: "aspect-[4/5] h-auto w-full",
  lg: "aspect-[4/5] h-auto w-full",
};

const frameWidth = {
  sm: "w-[72px]",
  md: "w-[96px]",
  lg: "w-[120px]",
};

export function PersonIdentity({
  src,
  alt,
  name,
  role,
  size = "md",
  tone = "light",
  layout = "row",
  className = "",
}: PersonIdentityProps) {
  const stacked = layout === "stack";

  return (
    <div
      className={cn(
        "flex min-w-0",
        stacked ? "flex-col items-center text-center" : "items-center gap-3 sm:gap-4",
        className,
      )}
    >
      <TricolorFrame inset="sm" className={cn("shrink-0", frameWidth[size])}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className={cn("w-full object-cover object-top", photoSize[size])} />
      </TricolorFrame>
      <div className={cn("min-w-0", stacked && "mt-3")}>
        <p className={cn("font-bold leading-6 break-words", tone === "dark" ? "text-white" : "text-[var(--ipf-navy)]")}>
          {name}
        </p>
        <p className={cn("mt-1 text-sm leading-5 break-words", tone === "dark" ? "text-white/75" : "text-[var(--ipf-muted)]")}>
          {role}
        </p>
      </div>
    </div>
  );
}
