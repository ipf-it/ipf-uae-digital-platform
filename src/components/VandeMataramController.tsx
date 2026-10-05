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

type VandeMataramContextValue = {
  /** True when the <audio> element is currently playing (derived from
   *  real `play`/`pause`/`ended` media events — never guessed). */
  playing: boolean;
  /** True once the track has reached its natural end at least once since
   *  the last play. Resets to false on the next play(). */
  ended: boolean;
  /** User-driven toggle: pause if playing, play if paused/ended.
   *  This is the ONLY code path that ever calls audio.play(); there is
   *  no autoplay, no auto-resume, no sessionStorage/localStorage state
   *  that can trigger playback automatically on later loads. */
  toggle: () => void;
};

const VandeMataramContext = createContext<VandeMataramContextValue | null>(null);

/**
 * Site-wide persistent Vande Mataram audio controller.
 *
 * Default behaviour (updated 5 Oct 2026)
 *   The player is OFF on every page load, refresh, hard refresh, route
 *   change, HMR remount, deployment, tab visibility change and browser
 *   restart. Playback begins ONLY after an explicit user click on the
 *   <VandeMataramButton> control. There is no autoplay attempt. There
 *   is no stored "was playing" state that can resurrect playback.
 *
 * Why the previous autoplay was removed
 *   During active development/testing the audio repeatedly started on
 *   its own — disruptive to QA and anyone browsing the site before a
 *   formal launch. The audio.play() call that lived in the mount
 *   useEffect, together with the sessionStorage "user-paused" flag that
 *   only existed to NOT re-force playback, are both gone. The <audio>
 *   element remains in the DOM but is paused by default and does NOT
 *   use the HTML autoplay attribute.
 *
 * What remained
 *   - Single <audio> element rendered once by this provider at the
 *     SiteLayout level, so route changes do NOT remount it — the song
 *     continues smoothly across SPA navigation IF the user already
 *     started it, otherwise it stays silent.
 *   - Real play/pause/ended event listeners keep UI state in sync with
 *     whatever the browser is actually doing (lock-screen media session,
 *     tab backgrounded, external controls).
 *   - End-of-track leaves the UI in the Play state and does NOT loop.
 *     The next user click rewinds and plays again.
 *
 * preload="none" — the file is NOT downloaded until the user actually
 * clicks play, so there is no latent "buffered and ready" audio sitting
 * primed for an accidental autoplay path, and no bandwidth cost for
 * visitors who never engage the control.
 */
export function VandeMataramProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /* Default state is OFF. This is initialised to false and is NEVER
     seeded from storage, URL, cookie, or any other source. */
  const [playing, setPlaying] = useState<boolean>(false);
  const [ended, setEnded] = useState<boolean>(false);

  /* Keep React state in strict sync with real media events. We never
     derive `playing` from our own calls to play()/pause() because the
     browser is authoritative. This listener does NOT itself initiate
     playback — it only reacts to events that the browser already fired. */
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

  /* Belt-and-braces: force the <audio> element to pause the moment the
     page is being unloaded or hidden. Addresses an edge case the founder
     observed where audio appeared to continue briefly after the user
     closed the site — modern browsers can keep media alive during tab
     teardown for the Media Session (notification shade, lock-screen
     controls, hardware play buttons). Explicitly pausing on pagehide
     stops that media session so the OS cannot resurrect playback. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const forcePause = () => {
      try {
        el.pause();
      } catch {
        /* ignore — element may already be destroyed during teardown */
      }
    };
    window.addEventListener("pagehide", forcePause);
    window.addEventListener("beforeunload", forcePause);
    return () => {
      window.removeEventListener("pagehide", forcePause);
      window.removeEventListener("beforeunload", forcePause);
    };
  }, []);

  /* Explicitly refuse the Media Session play action.
     Without this, when the user has already played once in a tab, the
     Chrome/Safari media controls (lock-screen, notification shade,
     keyboard play key, Bluetooth headset button) can send a `play`
     action that resumes our <audio> without a visible user click on
     the website. We override the action handler with a no-op so those
     external play buttons are ignored for Vande Mataram. */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    try {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
    } catch {
      /* older browsers that don't fully implement setActionHandler */
    }
  }, []);

  /* The ONLY code path that can start audio playback. Bound to a real
     user click/tap via <VandeMataramButton>. */
  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!el.paused) {
      el.pause();
      return;
    }

    /* If the track ended previously, rewind so a click behaves like
       "play again" rather than being a no-op. */
    if (el.ended || ended) {
      el.currentTime = 0;
    }
    const promise = el.play();
    if (promise && typeof promise.then === "function") {
      promise.catch(() => {
        /* Rare — this call is from a user gesture so policy should allow
           it. If the browser rejected for any other reason (decode error,
           aborted load) the `pause` event listener keeps the UI accurate. */
      });
    }
  }, [ended]);

  return (
    <VandeMataramContext.Provider value={{ playing, ended, toggle }}>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        /* preload="none" — nothing is fetched, buffered or primed until
           the user clicks the button. preload="auto" was removed with
           the autoplay useEffect to eliminate any "ready to play"
           precondition that could lead to accidental playback. */
        preload="none"
        /* NO `autoPlay` attribute. NO `loop` attribute. */
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
 * offsets so neither control ever overlaps the mobile tab bar.
 *
 * Audio = LEFT   Chat = RIGHT.
 *
 * Clicking this button is the ONLY way to begin Vande Mataram playback.
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
