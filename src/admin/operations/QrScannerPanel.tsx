import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

type QrScannerPanelProps = {
  active: boolean;
  onDecode: (text: string) => void;
};

/**
 * Live camera QR reader for the check-in desk — points at an attendee's digital ID (printed or on
 * their phone) and fires onDecode with whatever the QR contains (a /verify/<code> URL for current
 * cards, or a bare code for any older card still in circulation). Debouncing/dedupe against the
 * same code firing repeatedly while it's still in frame is the caller's job (CheckInView), not
 * this component's — it just reports every decode as it happens.
 */
export function QrScannerPanel({ active, onDecode }: QrScannerPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active || !videoRef.current) return;
    setError("");
    const scanner = new QrScanner(videoRef.current, (result) => onDecodeRef.current(result.data), {
      preferredCamera: "environment",
      highlightScanRegion: true,
      highlightCodeOutline: true,
      maxScansPerSecond: 5,
    });
    scanner.start().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not access the camera");
    });
    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ipf-line)] bg-black">
      <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
      {error ? <p className="bg-white p-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
