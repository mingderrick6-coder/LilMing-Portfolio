"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CollectionImage } from "@/data/collections";
import styles from "./LongArtworkGallery.module.css";

type LongArtworkGalleryProps = {
  images: CollectionImage[];
};

export default function LongArtworkGallery({ images }: LongArtworkGalleryProps) {
  const [preview, setPreview] = useState<CollectionImage | null>(null);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef(0);
  const closeTimerRef = useRef(0);

  const closePreview = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    window.clearTimeout(closeTimerRef.current);
    setVisible(false);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200;
    closeTimerRef.current = window.setTimeout(() => setPreview(null), duration);
  }, []);

  useEffect(() => {
    if (!preview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePreview();
      } else if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(closeTimerRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
      previousFocusRef.current = null;
    };
  }, [closePreview, preview]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus({ preventScroll: true });
  }, [visible]);

  const openPreview = (image: CollectionImage) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setVisible(false);
    setPreview(image);
  };

  return (
    <>
      <div className={styles.gallery}>
        {images.map((image, index) => (
          <article key={image.id} id={`work-${image.id}`} className={styles.work}>
            <header className={styles.workHeading}>
              <h2><span>{String(index + 1).padStart(2, "0")}</span>{image.title}</h2>
              <span className={styles.hint}>点击查看完整长图 <span aria-hidden="true">↗</span></span>
            </header>
            <div className={styles.presentation}>
              <button
                type="button"
                className={styles.phone}
                onClick={() => openPreview(image)}
                aria-label={`查看完整长图：${image.title}`}
              >
                <span className={styles.phoneScreen}>
                  <img
                    src={image.phonePreview || image.src}
                    alt={`${image.title}首屏`}
                    width={360}
                    height={780}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </span>
              </button>
              <div className={styles.segments} aria-label={`${image.title}分段预览`}>
                {image.segments?.map((segment, segmentIndex) => (
                  <button
                    key={segment.src}
                    type="button"
                    className={styles.segment}
                    onClick={() => openPreview(image)}
                    aria-label={`查看完整长图：${image.title}，第${segmentIndex + 1}段`}
                  >
                    <img
                      src={segment.src}
                      alt={`${image.title}第${segmentIndex + 1}段`}
                      width={segment.width}
                      height={segment.height}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className={styles.segmentLabel} aria-hidden="true">
                      {String(segmentIndex + 1).padStart(2, "0")} / {String(image.segments!.length).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {preview && createPortal(
        <div
          className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.title}完整长图`}
          aria-hidden={!visible}
          inert={!visible}
          onClick={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="关闭完整长图"
            onClick={closePreview}
          >
            <span aria-hidden="true" />
          </button>
          <figure className={styles.figure}>
            <figcaption>{preview.title}</figcaption>
            <img src={preview.src} alt={preview.title} width={preview.width} height={preview.height} decoding="async" />
          </figure>
        </div>,
        document.body
      )}
    </>
  );
}
