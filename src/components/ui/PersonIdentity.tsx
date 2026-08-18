import { cn } from "../../lib/utils";
import { TricolorFrame } from "./TricolorFrame";

type PersonIdentityProps = {
  src: string;
  alt: string;
  name: string;
  role: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
};

const photoSize = {
  sm: "h-[72px] w-[60px]",
  md: "h-[96px] w-[80px]",
  lg: "h-[148px] w-[120px]",
};

export function PersonIdentity({
  src,
  alt,
  name,
  role,
  size = "md",
  tone = "light",
  className = "",
}: PersonIdentityProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 sm:gap-4", className)}>
      <TricolorFrame inset="sm" className="w-auto shrink-0">
        <img src={src} alt={alt} className={cn("object-cover object-top", photoSize[size])} />
      </TricolorFrame>
      <div className="min-w-0">
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
