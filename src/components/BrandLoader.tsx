type BrandLoaderProps = {
  size?: number;
  label?: string;
  rotate?: boolean;
};

export function BrandLoader({
  size = 132,
  label = "IPF emblem",
  rotate = true,
}: BrandLoaderProps) {
  const emblemPath = "/legacy-assets/images/logo-emblem-full.png";

  return (
    <div
      className="inline-flex shrink-0 items-center justify-center"
      role="img"
      aria-label={label}
    >
      <img
        src={emblemPath}
        alt="IPF emblem"
        style={{ width: size, height: size }}
        className={rotate ? "object-contain drop-shadow-[0_10px_20px_rgba(2,6,23,0.45)] ipf-emblem-spin" : "object-contain"}
      />
    </div>
  );
}
