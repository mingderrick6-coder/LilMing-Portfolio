"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./Chrome.module.css";

export type PortfolioView = "spiral" | "list";

type SiteChromeProps = {
  currentView: PortfolioView;
  onViewChange: (view: PortfolioView) => void;
  menuOpen: boolean;
  onMenuOpen: () => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
};

const ambientSource =
  "/sites/pacomepertant-com-b16b412f/shared/sounds/ambient.ogg";
const hoverSource =
  "/sites/pacomepertant-com-b16b412f/shared/sounds/hover.ogg";

const showreelMarquee = Array(3).fill("LilMing · 2026 · Portfolio").join(" · ");

let ambientAudio: HTMLAudioElement | null = null;
let audioEnabled = false;
const hoverAudios: HTMLAudioElement[] = [];

function getAmbientAudio() {
  if (typeof window === "undefined") return null;

  if (!ambientAudio) {
    ambientAudio = new Audio(ambientSource);
    ambientAudio.loop = true;
    ambientAudio.volume = 0.3;
  }

  return ambientAudio;
}

export async function setAmbientEnabled(enabled: boolean) {
  audioEnabled = enabled;
  if (!enabled) hoverAudios.forEach((audio) => audio.pause());

  const audio = getAmbientAudio();
  if (!audio) return;

  if (!enabled) {
    audio.pause();
    return;
  }

  try {
    await audio.play();
  } catch {
    // A later user gesture can retry playback if the browser blocks autoplay.
  }
}

export function playHoverSound() {
  if (!audioEnabled || typeof window === "undefined") return;

  let audio = hoverAudios.find((sound) => sound.paused);
  if (!audio) {
    audio = new Audio(hoverSource);
    audio.volume = 1;
    hoverAudios.push(audio);
  }

  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Playback can be blocked until the user enables sound with a gesture.
  });
}

export default function SiteChrome({
  currentView,
  onViewChange,
  menuOpen,
  onMenuOpen,
  soundEnabled,
  onSoundToggle,
}: SiteChromeProps) {
  const [logoPhase, setLogoPhase] = useState(0);
  const [logoMotionKey, setLogoMotionKey] = useState(0);
  const menuTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    void setAmbientEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    const enabled = !soundEnabled;
    void setAmbientEnabled(enabled);
    onSoundToggle(enabled);
  };

  const animateLogo = () => {
    setLogoPhase((phase) => (phase >= 3 ? 1 : phase + 1));
    setLogoMotionKey((key) => key + 1);
  };

  const animateMenuLetters = () => {
    if (menuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    menuTextRef.current?.querySelectorAll<HTMLSpanElement>("span").forEach((letter, index) => {
      letter.getAnimations().forEach((animation) => animation.cancel());
      const transform = `rotate(${Math.random() * 30 - 15}deg) scale(${1.15 + Math.random() * 0.25})`;
      letter.animate(
        [
          { transform: "rotate(0deg) scale(1)", fontWeight: 500, offset: 0, easing: "cubic-bezier(.333333, 1, .666667, 1)" },
          { transform, fontWeight: 600, offset: 250 / 650, easing: "linear" },
          { transform, fontWeight: 600, offset: 400 / 650, easing: "linear(0 0%, .27923 4%, .53534 8%, .74415 12%, .89806 16%, 1 20%, 1.05855 24%, 1.0844 28%, 1.08804 32%, 1.07843 36%, 1.0625 40%, 1.04505 44%, 1.02904 48%, 1.01599 52%, 1.00637 56%, 1 60%, .99634 64%, .99473 68%, .9945 72%, .9951 76%, .99609 80%, .99718 84%, .99818 88%, .999 92%, .9996 96%, 1 100%)" },
          { transform: "rotate(0deg) scale(1)", fontWeight: 500, offset: 1 },
        ],
        { duration: 650, delay: index * 50 },
      );
    });
  };

  return (
    <>
      <button
        className={styles.chromeLogo}
        type="button"
        onClick={animateLogo}
        data-screen-state={logoPhase}
        aria-label={`Animate Game Boy logo, screen reveal ${logoPhase === 0 ? 0 : logoPhase === 1 ? 10 : logoPhase === 2 ? 50 : 100}%`}
      >
        <span
          className={`${styles.logoMotion} ${logoMotionKey > 0 ? (logoMotionKey % 2 === 0 ? styles.logoMotionActiveAlt : styles.logoMotionActive) : ""}`}
        >
          <img
            src="/sites/pacomepertant-com-b16b412f/shared/gameboy-logo.png"
            alt=""
            width={100}
            height={100}
          />
          <span className={styles.gameboyScreen} aria-hidden="true" />
        </span>

        <span className={styles.logoTagWrapper} aria-hidden="true">
          <svg
            className={styles.logoBurst}
            viewBox="0 0 74 71"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gameboy-logo-burst" x1="7" x2="66" y1="65" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset=".1" stopColor="#77e9ff" />
                <stop offset="1" stopColor="#125dff" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gameboy-logo-burst)"
              d="m73 31.4-23.9-.2c-.8 0-1.2-1-.5-1.5L71.3 13c.4-.3.4-.8.2-1.2L69 8.5a.9.9 0 0 0-1.2-.1L45.3 24.8a.9.9 0 0 1-1.3-1l7.4-22.6a.9.9 0 0 0-.8-1.1L45.7 0c-.4 0-.7.2-.8.6l-8 24a.9.9 0 0 1-1.6.3L23.7 8.2a.9.9 0 0 0-1.2-.3l-5 3.6c-.4.3-.5.8-.2 1.2l11.6 17c.4.5 0 1.3-.8 1.3l-25.4-.2c-.4 0-.7.2-.9.6l-1.8 5c-.1.6.3 1.2.9 1.2l24 .2c.8 0 1.2 1 .5 1.6L1.6 56.8c-.4.2-.5.8-.2 1.2l2.3 3.5c.2.4.8.5 1.2.2l23.7-17.4a.9.9 0 0 1 1.4 1l-8.2 24.4c-.1.6.3 1.1.9 1.1l5.2.1c.4 0 .8-.2.9-.6l8.5-25.9a.9.9 0 0 1 1.5-.2L50.9 62c.3.4.8.5 1.3.2l5-3.9c.5-.3.5-.8.3-1.2L45.2 39.4A.9.9 0 0 1 46 38l25.6.2c.4 0 .7-.2.8-.6l1.5-5a.9.9 0 0 0-.8-1.1Z"
            />
          </svg>
          <svg
            className={styles.logoTag}
            viewBox="0 0 157.2 59.6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#f8f8f8"
              d="M130 59.6H0l16.7-46.4A20 20 0 0 1 35.6 0H137A20 20 0 0 1 156 26.9l-7 19.4a20 20 0 0 1-19 13.3Z"
            />
            <path d="M39.7 22.7c5.2 0 8.5 3.2 9.1 7.6H44c-.6-1.9-2-3.3-4.2-3.3-3.1 0-4.8 2.7-4.8 5.7s1.7 5.8 4.8 5.8c2.3 0 3.6-1.5 4.2-3.4h4.8c-.6 4.4-4 7.6-9 7.6-6 0-9.8-4.6-9.8-10s3.8-10 9.7-10ZM52.5 15.4h5v26.9h-5V15.4ZM62.5 15.7h5v4.8h-5v-4.8Zm0 7.4h5v19.1h-5v-19ZM81 22.7c5 0 8.4 3.2 9 7.6h-4.8c-.5-1.9-1.9-3.3-4.2-3.3-3.1 0-4.8 2.7-4.8 5.7s1.7 5.8 4.8 5.8c2.3 0 3.7-1.5 4.2-3.4H90c-.6 4.4-3.9 7.6-9 7.6-6 0-9.8-4.6-9.8-10s3.8-10 9.8-10ZM93.5 15.4h5V31l7.2-7.8h5.9l-7 7.7 7.1 11.4h-5.6l-4.8-7.8-2.8 2.9v5h-5V15.4ZM115 36.8h5.5v5.5h-5.4v-5.5Zm.2-10.4v-9.9h5.2v9.9l-1.2 8h-2.8l-1.2-8ZM125.9 36.8h5.4v5.5h-5.4v-5.5Zm0-10.4v-9.9h5.3v9.9l-1.2 8h-2.8l-1.2-8Z" />
          </svg>
        </span>
      </button>

      <nav className={styles.viewSwitch} aria-label="Project view">
        {(["spiral", "list"] as const).map((view, index) => {
          const active = view === currentView;
          return (
            <span className={styles.viewOption} key={view}>
              {index === 1 && <span className={styles.viewDot} aria-hidden="true" />}
              <button
                className={`${styles.viewButton} ${active ? styles.viewButtonActive : ""}`}
                type="button"
                aria-pressed={active}
                onClick={() => onViewChange(view)}
              >
                <span className={styles.viewLabelRoll} aria-hidden="true">
                  <span>{view}</span>
                  <span>{view}</span>
                </span>
                <span className={styles.srOnly}>{view}</span>
              </button>
            </span>
          );
        })}
      </nav>

      <button
        id="portfolio-menu-button"
        className={styles.menuButton}
        type="button"
        onClick={() => { if (!menuOpen) onMenuOpen(); }}
        onMouseEnter={animateMenuLetters}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) animateMenuLetters(); }}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls="portfolio-menu"
      >
        <span ref={menuTextRef} className={`${styles.menuText} ${menuOpen ? styles.menuTextOpen : ""}`} aria-hidden="true">
          <span className={styles.menuLetter}>m</span>
          <span className={styles.menuLetter}>e</span>
          <span className={styles.menuLetter}>n</span>
          <span className={styles.menuLetter}>u</span>
        </span>
        <span className={styles.srOnly}>menu</span>
      </button>

      <a className={styles.showreel} href="#showreel" aria-label="View showreel">
        <span className={styles.showreelCard}>
          <span className={styles.marqueeContainer} aria-hidden="true">
            {Array.from(showreelMarquee).map((character, index) => (
              <span
                className={styles.marqueeText}
                style={{ animationDelay: `${index * 0.12}s` }}
                key={`${character}-${index}`}
              >
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </span>
          <img
            src="/sites/pacomepertant-com-b16b412f/shared/reel-thumbnail.png"
            alt="Showreel preview"
          />
        </span>
      </a>

      <button
        className={styles.soundButton}
        type="button"
        onClick={toggleSound}
        aria-label={soundEnabled ? "Mute ambient sound" : "Play ambient sound"}
        aria-pressed={soundEnabled}
      >
        <svg
          className={styles.speakerIcon}
          width="14"
          height="12"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2.66667 8.00014H1.33334C1.15653 8.00014 0.986958 7.92991 0.861934 7.80488C0.73691 7.67986 0.666672 7.51029 0.666672 7.33348V4.66681C0.666672 4.49 0.73691 4.32043 0.861934 4.19541C0.986958 4.07038 1.15653 4.00014 1.33334 4.00014H2.66667L5.00001 1.00014C5.05827 0.886965 5.1551 0.79836 5.273 0.750339C5.39089 0.702319 5.52207 0.698051 5.64284 0.738307C5.76361 0.778562 5.86599 0.860685 5.93149 0.969838C5.997 1.07899 6.0213 1.20797 6.00001 1.33348V10.6668C6.0213 10.7923 5.997 10.9213 5.93149 11.0305C5.86599 11.1396 5.76361 11.2217 5.64284 11.262C5.52207 11.3022 5.39089 11.298 5.273 11.2499C5.1551 11.2019 5.05827 11.1133 5.00001 11.0001L2.66667 8.00014Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {soundEnabled ? (
            <>
              <path
                d="M8.66678 3.3335C9.08077 3.64399 9.41678 4.0466 9.6482 4.50945C9.87963 4.9723 10.0001 5.48268 10.0001 6.00016C10.0001 6.51765 9.87963 7.02802 9.6482 7.49087C9.41678 7.95373 9.08077 8.35634 8.66678 8.66683"
                stroke="currentColor"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 1C11.621 1.58217 12.125 2.33707 12.4721 3.20492C12.8193 4.07276 13 5.02972 13 6C13 6.97028 12.8193 7.92724 12.4721 8.79508C12.125 9.66293 11.621 10.4178 11 11"
                stroke="currentColor"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <path
              d="M13.7879 3.60257C13.905 3.71973 13.905 3.90968 13.7879 4.02684L12.0268 5.78787C11.9097 5.90503 11.9097 6.09497 12.0268 6.21213L13.7879 7.97316C13.905 8.09032 13.905 8.28027 13.7879 8.39743L13.3974 8.78787C13.2803 8.90503 13.0903 8.90503 12.9732 8.78787L11.2121 7.02684C11.095 6.90968 10.905 6.90968 10.7879 7.02684L9.02684 8.78787C8.90968 8.90503 8.71973 8.90503 8.60257 8.78787L8.21213 8.39743C8.09497 8.28027 8.09497 8.09032 8.21213 7.97316L9.97316 6.21213C10.0903 6.09497 10.0903 5.90503 9.97316 5.78787L8.21213 4.02684C8.09497 3.90968 8.09497 3.71973 8.21213 3.60257L8.60257 3.21213C8.71973 3.09497 8.90968 3.09497 9.02684 3.21213L10.7879 4.97316C10.905 5.09032 11.095 5.09032 11.2121 4.97316L12.9732 3.21213C13.0903 3.09497 13.2803 3.09497 13.3974 3.21213L13.7879 3.60257Z"
              fill="currentColor"
            />
          )}
        </svg>
        <span className={styles.soundBackground} aria-hidden="true" />
      </button>
    </>
  );
}
