import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { FramedPhoto } from "./TricolorFrame";

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  description?: string;
  eyebrow?: string;
  to?: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  imageClassName?: string;
  tone?: "paper" | "ivory" | "navy";
  size?: "sm" | "md" | "lg";
  flush?: boolean;
  align?: "left" | "center";
  id?: string;
  className?: string;
}>;

export function Card({
  title,
  description,
  eyebrow,
  to,
  href,
  image,
  imageAlt = "",
  imageFit = "cover",
  imageClassName = "",
  tone = "paper",
  size = "md",
  flush = false,
  align = "left",
  id,
  className = "",
  children,
}: CardProps) {
  const navy = tone === "navy";
  const pad = flush ? "p-0" : size === "sm" ? "p-4" : size === "lg" ? "p-6 sm:p-8" : image ? "p-5" : "p-6";
  const titleSize = size === "sm" ? "text-base font-semibold" : size === "lg" ? "text-xl font-bold sm:text-2xl" : "text-lg font-semibold";

  const body = (
    <>
      {image ? (
        <FramedPhoto
          src={image}
          alt={imageAlt || (typeof title === "string" ? title : "")}
          fit={imageFit}
          imgClassName={cn(
            "w-full",
            imageFit === "contain"
              ? "h-52 bg-[var(--ipf-navy)]"
              : size === "sm"
                ? "aspect-[16/10] h-auto min-h-[9rem] object-top"
                : "aspect-[4/3] h-auto min-h-[13rem] object-top",
            imageClassName,
          )}
        />
      ) : null}
      <div className={cn("flex flex-1 flex-col", pad, align === "center" && "items-center text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.16em]",
              navy ? "text-[var(--ipf-gold)]" : "text-[var(--ipf-green)]",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h3
            className={cn(
              titleSize,
              navy ? "text-white" : "text-[var(--ipf-navy)]",
              eyebrow && "mt-2",
            )}
          >
            {title}
          </h3>
        ) : null}
        {description ? (
          <p
            className={cn(
              "text-sm leading-7",
              navy ? "text-white/85" : "text-[var(--ipf-muted)]",
              title || eyebrow ? "mt-2" : "",
              !children && "flex-1",
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className={cn("flex-1", title || description || eyebrow ? "mt-4" : "")}>{children}</div> : null}
      </div>
    </>
  );

  const classes = cn(
    "flex h-full min-w-0 flex-col overflow-hidden rounded-xl border shadow-[0_8px_24px_rgba(11,31,58,0.06)]",
    navy ? "border-white/15 bg-[var(--ipf-navy)]" : tone === "ivory" ? "border-[var(--ipf-line)] bg-[var(--ipf-ivory)]" : "border-[var(--ipf-line)] bg-[var(--ipf-paper)]",
    (to || href) &&
      (navy
        ? "transition duration-200 hover:bg-white/10"
        : "transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ipf-navy)]/40 hover:shadow-[0_14px_32px_rgba(11,31,58,0.1)]"),
    id && "scroll-mt-32",
    className,
  );

  if (to) {
    return (
      <Link id={id} to={to} className={classes}>
        {body}
      </Link>
    );
  }

  if (href) {
    return (
      <a id={id} href={href} className={classes} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <article id={id} className={classes}>
      {body}
    </article>
  );
}

type CardGridProps = PropsWithChildren<{
  columns?: 2 | 3 | 4;
  className?: string;
}>;

export function CardGrid({ columns = 3, className = "", children }: CardGridProps) {
  return (
    <div
      className={cn(
        "grid items-stretch gap-5",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
