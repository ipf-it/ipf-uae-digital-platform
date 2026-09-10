import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type QrCodeProps = {
  value: string;
  size?: number;
  alt: string;
};

/** Renders entirely client-side (no network request) — the encoded value never leaves the
 * browser, unlike a third-party "generate my QR" API. */
export function QrCode({ value, size = 148, alt }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 2 }).catch(() => undefined);
  }, [value, size]);

  return <canvas ref={canvasRef} role="img" aria-label={alt} className="rounded-lg bg-white p-1" />;
}
