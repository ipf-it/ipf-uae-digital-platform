import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/vande-mataram.mp3";
/* Session-only flag. If the user has deliberately paused during this
   browsing session we respect that and do NOT re-attempt autoplay on
   subsequent mounts/navigations. sessionStorage clears when the tab
   closes, so a fresh visit later re-attempts autoplay. */
const USER_PAUSED_KEY = "ipf.vande-mataram.user-paused";

/**
 * Vande Mataram audio toggle, anchored to the bottom-LEFT of the hero so
 * it does not compete with the chat / help launcher at the bottom-right.
 *
 * Playback behaviour
 *   1. On mount the component attempts an AUDIBLE autoplay by calling
 *      audio.play(). Modern browsers (Chrome 66+, Safari, iOS Safari,
 *      Firefox) can reject this with a NotAllowedError unless the user
 *      has already interacted with the page or the origin is marked as
 *      allowed via the browser's media-engagement index.
 *   2. If play() resolves, state flips to playing and the UI reflects it.
 *   3. If play() rejects, we fail silently — no console error reaches
 *      the user — and the control stays in the paused state ready for a
 *      single click to start playback (which IS a user gesture and will
 *      satisfy the autoplay policy).
 *   4. If the user explicitly clicks pause we set a sessionStorage flag
 *      so remounts during the same tab session (e.g. route changes) do
 *      NOT re-force playback.
 *   5. The <audio> element is a single DOM node managed by this
 *      component's lifecycle; React only mounts one instance at a time,
 *      so there is no duplication across navigations.
 *   6. preload="auto" is required so the file is buffered and ready for
 *      the autoplay attempt. Without it Safari sometimes silently fails
 *      even when audible autoplay would otherwise be permitted.
 */
export function VandeMataramToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const userPausedRef = useRef<boolean>(false);

  /* Attempt autoplay on mount. Respects the session-scoped pause flag. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    try {
      userPausedRef.current = sessionStorage.getItem(USER_PAUSED_KEY) === "1";
    } catch {
      /* sessionStorage can throw in some private-browsing contexts;
         fall through and treat as never-paused. */
      userPausedRef.current = false;
    }
    if (userPausedRef.current) return;
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.catch(() => {
        /* Browser blocked audible autoplay — this is normal. The UI
           stays in paused state; a single user click will succeed. */
        setPlaying(false);
      });
    }
  }, []);

  /* Pause on unmount/navigation to avoid orphan audio playing after the
     component leaves the tree. */
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    };
  }, []);

  /* Keep the UI in sync with real audio state (play/pause events may
     fire from the browser's own controls, media session, tab backgrounding,
     or end-of-media when loop would otherwise cover). */
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
      /* Remember the user's explicit decision for this session so a
         remount doesn't re-force playback. */
      try {
        sessionStorage.setItem(USER_PAUSED_KEY, "1");
      } catch {
        /* ignore quota / disabled storage */
      }
      userPausedRef.current = true;
      return;
    }
    /* User explicitly started playback — clear the session pause flag
       so autoplay can resume on subsequent mounts in this tab. */
    try {
      sessionStorage.removeItem(USER_PAUSED_KEY);
    } catch {
      /* ignore */
    }
    userPausedRef.current = false;
    el.play().catch(() => {
      setPlaying(false);
    });
  };

  const label = playing ? "Pause Vande Mataram" : "Play Vande Mataram";

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        loop
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={label}
        className="group absolute bottom-4 left-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#5A0F1E] text-[#FFF8EE] shadow-[0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-[var(--ipf-gold)]/60 transition hover:bg-[#3A0913] hover:ring-[var(--ipf-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)] md:bottom-6 md:left-6 lg:h-12 lg:w-12"
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
