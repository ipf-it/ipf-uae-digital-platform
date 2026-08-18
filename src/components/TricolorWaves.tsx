function ClothRibbon({ side }: { side: "left" | "right" }) {
  const flip = side === "right" ? "scale-x-[-1]" : "";

  return (
    <div className={`ipf-cloth ipf-cloth--${side}`} aria-hidden="true">
      <svg className={flip} viewBox="0 0 80 900" preserveAspectRatio="none">
        <path
          fill="#FF9933"
          d="M0 0 C28 70 8 140 32 210 C56 280 12 350 36 420 C60 490 10 560 34 630 C58 700 14 770 30 840 L0 900 Z"
        />
        <path
          fill="#FFFFFF"
          opacity="0.92"
          d="M0 20 C22 90 6 160 24 230 C42 300 8 370 26 440 C44 510 6 580 24 650 C42 720 10 790 22 860 L0 900 Z"
        />
        <path
          fill="#138808"
          d="M0 40 C18 110 4 180 20 250 C36 320 6 390 20 460 C34 530 4 600 18 670 C32 740 8 810 16 880 L0 900 Z"
        />
      </svg>
    </div>
  );
}

export function TricolorWaves() {
  return (
    <>
      <ClothRibbon side="left" />
      <ClothRibbon side="right" />
    </>
  );
}
