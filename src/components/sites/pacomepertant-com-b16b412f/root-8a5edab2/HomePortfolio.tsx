"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { projects } from "@/data/projects";

import BackgroundGrid from "./BackgroundGrid";
import EntranceOverlay from "./EntranceOverlay";
import ListView from "./ListView";
import MenuDrawer from "./MenuDrawer";
import ProjectPreview from "./ProjectPreview";
import SiteChrome, { type PortfolioView } from "./SiteChrome";
import SpiralView from "./SpiralView";
import styles from "./Home.module.css";

type PortfolioWindow = Window & {
  __portfolioEntranceCompleted?: boolean;
};

export default function HomePortfolio() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<PortfolioView>("spiral");
  const [spiralAvailable, setSpiralAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [previewProjectIndex, setPreviewProjectIndex] = useState<number | null>(null);
  const handleSpiralUnavailable = useCallback(() => {
    setSpiralAvailable(false);
    setView("list");
  }, []);

  useLayoutEffect(() => {
    const hasEntered = Boolean((window as PortfolioWindow).__portfolioEntranceCompleted);
    setEntered(hasEntered);
    if (hasEntered && new URLSearchParams(window.location.search).get("view") === "list") {
      setView("list");
    }
  }, []);

  return (
    <main className={styles.home}>
      <BackgroundGrid />

      {entered && spiralAvailable && (
        <SpiralView
          active={view === "spiral"}
          paused={previewProjectIndex !== null}
          onProjectOpen={setPreviewProjectIndex}
          onUnavailable={handleSpiralUnavailable}
        />
      )}
      <ListView active={view === "list"} />

      <SiteChrome
        currentView={view}
        onViewChange={(nextView) => setView(spiralAvailable ? nextView : "list")}
        menuOpen={menuOpen}
        onMenuOpen={() => setMenuOpen(true)}
        soundEnabled={soundEnabled}
        onSoundToggle={setSoundEnabled}
      />

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <ProjectPreview
        preload={entered}
        project={previewProjectIndex === null ? null : projects[previewProjectIndex]}
        onClose={() => setPreviewProjectIndex(null)}
      />

      <section className={styles.showreelModal} id="showreel" aria-label="Showreel player">
        <a className={styles.showreelBackdrop} href="#" aria-label="Close showreel" />
        <div className={styles.showreelPlayer}>
          <video
            controls
            playsInline
            poster="/sites/pacomepertant-com-b16b412f/shared/reel-thumbnail.png"
            preload={entered ? "metadata" : "none"}
          >
            <source
              src="https://stream.mux.com/ycc6bXk6hOWxGnyb6F3wvUxPPLiDML00P9OPkYMjuSN8/high.mp4"
              type="video/mp4"
            />
          </video>
          <a className={styles.showreelClose} href="#" aria-label="Close showreel">
            ×
          </a>
        </div>
      </section>

      {!entered && (
        <EntranceOverlay
          onDismiss={(enabled) => {
            (window as PortfolioWindow).__portfolioEntranceCompleted = true;
            setSoundEnabled(enabled);
            setEntered(true);
          }}
        />
      )}
    </main>
  );
}
