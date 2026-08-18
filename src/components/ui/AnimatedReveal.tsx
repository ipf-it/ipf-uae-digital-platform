import type { PropsWithChildren } from "react";

type AnimatedRevealProps = PropsWithChildren<{
  delay?: number;
  y?: number;
  className?: string;
}>;

export function AnimatedReveal({ children, delay = 0, y = 22, className }: AnimatedRevealProps) {
  void delay;
  void y;
  return (
    <div className={className}>
      {children}
    </div>
  );
}
