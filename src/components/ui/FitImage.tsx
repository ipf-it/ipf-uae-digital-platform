import { cn } from "../../lib/utils";
import { FramedPhoto } from "./TricolorFrame";

type FitImageProps = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  fill?: boolean;
  className?: string;
};

export function FitImage({ src, alt, fit = "cover", fill = false, className = "" }: FitImageProps) {
  return (
    <FramedPhoto
      src={src}
      alt={alt}
      fit={fit}
      className={cn(fill && "h-full min-h-[200px] sm:min-h-[260px]", className)}
      imgClassName={cn(
        "w-full bg-[var(--ipf-paper)]",
        fill ? "h-full min-h-[180px] sm:min-h-[240px]" : "h-[200px] sm:h-[240px]",
        fit === "contain" && "p-2",
      )}
    />
  );
}
