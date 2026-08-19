import type { ImgHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type TricolorFrameProps = PropsWithChildren<{
  className?: string;
  inset?: "sm" | "md";
}>;

export function TricolorFrame({ children, className = "", inset = "md" }: TricolorFrameProps) {
  return (
    <div
      className={cn(
        "max-w-full overflow-hidden bg-[linear-gradient(180deg,rgba(255,153,51,0.55)_0%,rgba(255,255,255,0.92)_50%,rgba(19,136,8,0.5)_100%)] p-[3px]",
        className,
      )}
    >
      <div className={cn("h-full min-w-0 overflow-hidden bg-[var(--ipf-paper)]", inset === "sm" ? "p-[3px]" : "p-1.5")}>
        {children}
      </div>
    </div>
  );
}

type FramedPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fit?: "cover" | "contain";
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
};

export function FramedPhoto({
  src,
  alt,
  className = "",
  imgClassName = "",
  fit = "cover",
  loading,
}: FramedPhotoProps) {
  return (
    <TricolorFrame className={cn("w-full min-w-0", className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          "block h-full w-full max-w-none",
          fit === "contain"
            ? "bg-[var(--ipf-navy)] object-contain object-center"
            : "bg-[var(--ipf-navy)] object-contain object-center ipf-photo-cover-desktop md:object-top",
          imgClassName,
        )}
      />
    </TricolorFrame>
  );
}
