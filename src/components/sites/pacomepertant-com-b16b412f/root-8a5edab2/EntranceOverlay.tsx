"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { AnimationItem } from "lottie-web";
import { getImageProps } from "next/image";

import { setAmbientEnabled } from "./SiteChrome";
import styles from "./Chrome.module.css";

type EntranceOverlayProps = {
  onDismiss: (soundEnabled: boolean) => void;
};

const artworkSource = getImageProps({
  src: "/intro-graphics-original.png", alt: "", width: 440, height: 276, quality: 100,
}).props.src;
const avatarSource = getImageProps({
  src: "/sites/pacomepertant-com-b16b412f/shared/intro-avatar.png",
  alt: "", width: 110, height: 108, quality: 100,
}).props.src;

export default function EntranceOverlay({ onDismiss }: EntranceOverlayProps) {
  const animationContainer = useRef<HTMLDivElement>(null);
  const exitTimer = useRef<number | undefined>(undefined);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showArtwork, setShowArtwork] = useState(false);
  const [circleHandoff, setCircleHandoff] = useState<CSSProperties>();
  const [artworkLeaving, setArtworkLeaving] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let animation: AnimationItem | undefined;
    let cancelled = false;
    let artworkTimer: number | undefined;
    let identityTimer: number | undefined;
    let artworkCleanupTimer: number | undefined;
    let loadingTimer: number | undefined;

    const clearAnimationTimers = () => {
      window.clearTimeout(artworkTimer);
      window.clearTimeout(identityTimer);
      window.clearTimeout(artworkCleanupTimer);
      window.clearTimeout(loadingTimer);
    };
    const finishSafely = () => {
      if (cancelled) return;
      cancelled = true;
      clearAnimationTimers();
      animation?.destroy();
      setAnimationLoaded(true);
      setShowArtwork(false);
      setShowIdentity(true);
      setAnimationComplete(true);
    };
    loadingTimer = window.setTimeout(finishSafely, 12000);

    const startAnimation = async () => {
      const artworkImage = new Image();
      artworkImage.src = artworkSource;
      const avatarImage = new Image();
      avatarImage.src = avatarSource;
      const [lottieModule, response] = await Promise.all([
        import("lottie-web"),
        fetch("/sites/pacomepertant-com-b16b412f/shared/loader-animation.json"),
        artworkImage.decode(),
        avatarImage.decode(),
      ]);

      if (cancelled || !animationContainer.current) return;
      if (!response.ok) throw new Error("Entrance animation could not load");

      const animationData = await response.json();
      const loaderData = animationData as {
        chars?: unknown;
        assets?: Array<{ id?: string }>;
        fonts?: { list?: Array<{ fFamily?: string; fName?: string }> };
        layers?: Array<{
          ind?: number;
          t?: { d?: { k?: Array<{ s?: { f?: string; t?: string } }> } };
        }>;
      };
      const nameStyle = loaderData.layers
        ?.find((layer) => layer.t?.d?.k?.[0]?.s?.t === "I’m Pacôme")
        ?.t?.d?.k?.[0]?.s;

      if (nameStyle) {
        nameStyle.t = "I'm LilMing";
        nameStyle.f = "Indivisible Variable";
      }

      // Replace the final face/mattes and the old colored tile, keeping the opening circle and hey.
      loaderData.layers = loaderData.layers?.filter(
        (layer) => ![1, 2, 3, 5, 6, 10, 11, 12, 13, 14, 15].includes(layer.ind ?? -1),
      );
      loaderData.assets = loaderData.assets?.filter((asset) => asset.id !== "image_0");

      delete loaderData.chars;
      loaderData.fonts?.list?.forEach((font) => {
        font.fFamily = "Indivisible Variable";
        font.fName = "Indivisible Variable";
      });

      if (cancelled || !animationContainer.current) return;

      animation = lottieModule.default.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData,
      });

      animation.addEventListener("DOMLoaded", () => {
        if (!cancelled) setAnimationLoaded(true);
      });
      animation.addEventListener("error", finishSafely);
      animation.addEventListener("data_failed", finishSafely);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.clearTimeout(loadingTimer);
        animation.goToAndStop(animation.totalFrames - 1, true);
        setAnimationLoaded(true);
        setShowIdentity(true);
        setAnimationComplete(true);
        return;
      }

      let segment = 0;
      animation.addEventListener("complete", () => {
        if (cancelled) return;

        if (segment === 0) {
          segment = 1;
          const circle = animationContainer.current?.querySelector<SVGPathElement>(
            'path[fill="rgb(12,0,232)"]',
          );
          const circleBounds = circle?.getBoundingClientRect();
          const stageBounds = animationContainer.current?.parentElement?.getBoundingClientRect();

          flushSync(() => {
            if (circleBounds && stageBounds) {
              setCircleHandoff({
                "--handoff-x": `${circleBounds.x + circleBounds.width / 2 - stageBounds.x - 173.5}px`,
                "--handoff-y": `${circleBounds.y + circleBounds.height / 2 - stageBounds.y - 139.7}px`,
                "--handoff-scale-x": circleBounds.width / 31,
                "--handoff-scale-y": circleBounds.height / 31,
              } as CSSProperties);
            }
            setShowArtwork(true);
          });
          artworkTimer = window.setTimeout(() => {
            if (cancelled) return;
            setArtworkLeaving(true);
            identityTimer = window.setTimeout(() => {
              if (cancelled) return;
              setShowIdentity(true);
              animation?.playSegments([50, 67], true);
            }, 140);
            artworkCleanupTimer = window.setTimeout(() => {
              if (!cancelled) setShowArtwork(false);
            }, 520);
          }, 1900);
        } else {
          window.clearTimeout(loadingTimer);
          setAnimationComplete(true);
        }
      });
      animation.playSegments([0, 20], true);
    };

    void startAnimation().catch(finishSafely);

    return () => {
      cancelled = true;
      clearAnimationTimers();
      window.clearTimeout(exitTimer.current);
      animation?.destroy();
    };
  }, []);

  const enter = (withSound: boolean) => {
    if (leaving) return;
    void setAmbientEnabled(withSound);
    setLeaving(true);
    exitTimer.current = window.setTimeout(() => onDismiss(withSound), 500);
  };

  return (
    <section
      className={`${styles.entrance} ${showIdentity ? styles.entranceFinal : ""} ${animationComplete ? styles.entranceReady : ""} ${leaving ? styles.entranceLeaving : ""}`}
      aria-label="Enter the portfolio"
      aria-hidden={leaving}
      aria-busy={!animationComplete}
    >
      <div className={styles.entranceAnimation} aria-hidden="true">
        <div
          ref={animationContainer}
          className={`${styles.entranceAnimationInner} ${showArtwork && !showIdentity ? styles.entranceAnimationPaused : ""}`}
        />
        {!animationLoaded && (
          <div className={styles.entranceAnimationInner}>
            <svg viewBox="0 0 500 500">
              <circle cx="250" cy="429.797" r="16.2472" fill="rgb(12,0,232)" />
            </svg>
          </div>
        )}
        <img
          className={styles.entranceAvatar}
          src={avatarSource}
          alt=""
          width={1230}
          height={1203}
          decoding="async"
        />
        <div
          className={`${styles.entranceArtStage} ${showArtwork ? styles.entranceArtStageActive : ""} ${artworkLeaving ? styles.entranceArtStageLeaving : ""}`}
          style={circleHandoff}
        >
          <div className={styles.entranceArtComposition}>
            <img
              className={styles.entranceArtShapes}
              src={artworkSource}
              alt=""
            />
            <span className={styles.entranceProgressCover} />
          </div>
          <div className={styles.entranceProgress}>
            <span className={styles.entranceProgressDot} />
          </div>
        </div>
      </div>

      <p className={styles.entranceCopy}>
        <span><span>I'm LilMing</span></span>
        <span><span>a <strong>visual designer</strong> from CN</span></span>
      </p>

      <button
        className={styles.enterButton}
        type="button"
        onClick={() => void enter(true)}
        disabled={!animationComplete || leaving}
      >
        enter website
        <span className={styles.enterDot} aria-hidden="true" />
      </button>

      <button
        className={styles.silentButton}
        type="button"
        onClick={() => void enter(false)}
        disabled={!animationComplete || leaving}
      >
        enter without sound
      </button>
    </section>
  );
}
