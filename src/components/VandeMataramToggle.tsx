import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/vande-mataram.mp3";

/**
 * Elegant audio toggle anchored to the bottom-right of the hero.
 *
 * Behaviour
 *   - On mount, audio is OFF. The <audio> element uses preload="none" so
 *     the browser does not download the file until the user explicitly plays it.
 *   - First click: audio.play() → aria-label becomes "Pause Vande Mataram".
 *     Second click: audio.pause() → aria-label becomes "Play Vande Mataram".
 *   - Audio loops independently of the WebM video (<audio loop>) so looping
 *     the video does not restart the audio.
 *   - On unmount or route change the audio is paused and reset.
 *
 * The control respects prefers-reduced-motion for VIDEO (the video component
 * handles that separately) but intentionally remains available so a user who
 * prefers reduced motion can still choose to play the national song.
 */
export function VandeMataramToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  // Reset / stop on unmount or navigation. Capture the ref.current at
  // effect setup so the cleanup references the same node we observed.
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    };
  }, []);

  // Keep the UI in sync if the browser pauses the audio for any reason
  // (tab backgrounded, media session interruption, etc.).
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);
    return () => {
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    el.play().catch(() => {
      // Autoplay policies may reject on some browsers until a user gesture
      // triggers the play; the click here IS the gesture, so the failure
      // path is rare — e.g. if the user denied autoplay permission.
      setPlaying(false);
    });
  };

  const label = playing ? "Pause Vande Mataram" : "Play Vande Mataram";

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="none"
        loop
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={label}
        className="group absolute bottom-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#5A0F1E] text-[#FFF8EE] shadow-[0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-[var(--ipf-gold)]/60 transition hover:bg-[#3A0913] hover:ring-[var(--ipf-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)] md:bottom-6 md:right-6 lg:h-12 lg:w-12"
      >
        {playing ? (
          /* speaker-on icon */
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        ) : (
          /* speaker-off icon (muted) */
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
            <path d="m17 9 4 6" />
            <path d="m21 9-4 6" />
          </svg>
        )}
      </button>
    </>
  );
}
