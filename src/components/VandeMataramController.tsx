import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const AUDIO_SRC = "/audio/vande-mataram.mp3";
const USER_PAUSED_KEY = "ipf.vande-mataram.user-paused";

/**
 * Module-level autoplay-attempted flag.
 *
 * React 19 <StrictMode> intentionally double-invokes effects in development
 * so bugs around subscription cleanup surface early. If the autoplay-attempt
 * logic lived in a per-mount useRef, StrictMode would call play() twice on
 * the fresh component mount, then once more after the cleanup pass remounted.
 * A module-level flag ensures audible autoplay is attempted exactly ONCE per
 * tab session regardless of how many times React mounts the provider.
 *
 * Production is unaffected (StrictMode is a dev-only wrapper for behaviour,
 * not a bundle guard), but it keeps dev output clean.
 */
let autoplayAttempted = false;

type VandeMataramContextValue = {
  /** True when the <audio> element is currently playing (derived from
   *  real `play`/`pause`/`ended` media events — never guessed). */
  playing: boolean;
  /** True once the track has reached its natural end at least once since
   *  the last play. Resets to false on the next play(). */
  ended: boolean;
  /** User-driven toggle: pause if playing, play if paused/ended.
   *  Writes/clears the session-scoped user-pause flag so the browser can
   *  resume autoplay on fresh visits but respects explicit pauses within
   *  the current tab. */
  toggle: () => void;
};

const VandeMataramContext = createContext<VandeMataramContextValue | null>(null);

/**
 * Site-wide persistent Vande Mataram audio controller.
 *
 * Lives inside <SiteLayout> ABOVE the react-router <Outlet /> so route
 * navigation does NOT unmount it. One <audio> element exists for the
 * whole public site; starting playback on the homepage and navigating
 * to /about keeps the song playing without a restart.
 *
 * Autoplay policy
 *   Modern browsers (Chrome 66+, Safari, iOS Safari, Firefox) can reject
 *   audible autoplay with NotAllowedError until the origin has sufficient
 *   media engagement OR the user has interacted with the page. We attempt
 *   play() exactly once, catch rejection silently, and let the UI reflect
 *   whatever `paused` the browser actually reports via media events. One
 *   deliberate click on the control then succeeds as a user gesture.
 *
 * User intent
 *   An explicit pause writes USER_PAUSED_KEY to sessionStorage. A later
 *   route change / re-render / visibilitychange will NOT re-force play.
 *   Explicit play clears the key so a later visit resumes autoplay.
 *
 * End-of-track
 *   No `loop` attribute — Vande Mataram plays once. On `ended` the UI
 *   returns to the Play state; the next click rewinds and starts over.
 */
export function VandeMataramProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [ended, setEnded] = useState<boolean>(false);

  /* Keep React state in strict sync with real media events. We never
     derive `playing` from our own calls to play()/pause() because the
     browser is authoritative — autoplay can be blocked, media sessions
     can pause from the lock screen, tab backgrounding can intervene. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  /* Attempt audible autoplay ONCE per tab session.
     - Respects a prior session-scoped user pause.
     - Catches browser-policy rejection silently so no console error
       surfaces to visitors. The UI stays in the paused state and
       `playing` remains false; the first click will succeed.
     - Does NOT retry on rejection, does NOT use intervals, does NOT
       mute-and-unmute. */
  useEffect(() => {
    if (autoplayAttempted) return;
    autoplayAttempted = true;

    const el = audioRef.current;
    if (!el) return;

    let userPaused = false;
    try {
      userPaused = sessionStorage.getItem(USER_PAUSED_KEY) === "1";
    } catch {
      /* private browsing can throw — treat as never-paused */
    }
    if (userPaused) return;

    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.catch(() => {
        /* Browser blocked audible autoplay. Expected. No action required
           — the `pause` event listener above will keep setPlaying(false)
           in sync so the UI shows the correct Play affordance. */
      });
    }
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!el.paused) {
      /* Explicit pause by the user — record intent for this session. */
      el.pause();
      try {
        sessionStorage.setItem(USER_PAUSED_KEY, "1");
      } catch {
        /* ignore quota / disabled storage */
      }
      return;
    }

    /* Explicit play by the user. Clear the pause intent so later
       autoplay attempts (none in-session, but fresh page load) run. */
    try {
      sessionStorage.removeItem(USER_PAUSED_KEY);
    } catch {
      /* ignore */
    }
    /* If the track reached the end previously, rewind so a click
       behaves like "play again" rather than a no-op. */
    if (el.ended || ended) {
      el.currentTime = 0;
    }
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.catch(() => {
        /* Rare — this call is from a user gesture so policy should allow
           it. If something else rejected (decode error, aborted load),
           the browser's own `pause` event will keep state accurate. */
      });
    }
  }, [ended]);

  return (
    <VandeMataramContext.Provider value={{ playing, ended, toggle }}>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        aria-hidden="true"
      />
      {children}
    </VandeMataramContext.Provider>
  );
}

export function useVandeMataram(): VandeMataramContextValue {
  const ctx = useContext(VandeMataramContext);
  if (!ctx) {
    throw new Error(
      "useVandeMataram must be used inside <VandeMataramProvider>",
    );
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

function SpeakerOnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
      <path d="m17 9 4 6" />
      <path d="m21 9-4 6" />
    </svg>
  );
}

/**
 * Floating LEFT-side audio control. Rendered once by <SiteLayout>, visible
 * on every public page so the user can start/stop Vande Mataram from any
 * route. Mirrors the chat launcher's bottom-24 / lg:bottom-6 vertical
 * offsets so neither control ever overlaps the mobile tab bar (fixed
 * inset-x-0 bottom-0, xl:hidden).
 *
 * Audio = LEFT   Chat = RIGHT.
 */
export function VandeMataramButton() {
  const { playing, toggle } = useVandeMataram();
  const label = playing ? "Pause Vande Mataram" : "Play Vande Mataram";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      className="group fixed bottom-24 left-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#5A0F1E] text-[#FFF8EE] shadow-[0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-[var(--ipf-gold)]/60 transition hover:bg-[#3A0913] hover:ring-[var(--ipf-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ipf-gold)] lg:bottom-6 lg:left-6 lg:h-12 lg:w-12"
    >
      {playing ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  );
}
